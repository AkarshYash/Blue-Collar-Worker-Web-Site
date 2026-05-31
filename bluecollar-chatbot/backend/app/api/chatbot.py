"""
FastAPI router for the BlueCollar chatbot.
Exposes REST + WebSocket endpoints and Twilio webhooks for WhatsApp/SMS/Voice.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..services.chatbot_engine import ChatbotEngine
from ..services.translation_service import TranslationService
from ..services.sms_chatbot import SMSChatbot
from ..models.database import get_db
from ..models.db_models import ChatbotFeedback
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

# Shared engine instance (initialised once at import time)
_engine = ChatbotEngine()
_translation = TranslationService()
_sms = SMSChatbot()


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    user_id: str
    user_type: str          # customer | worker | admin
    message: str
    language: str = "en"
    session_id: Optional[str] = None


class FeedbackRequest(BaseModel):
    message_id: str
    user_id: str
    helpful: bool
    rating: Optional[int] = None
    comment: Optional[str] = None


class VoiceRequest(BaseModel):
    user_id: str
    user_type: str
    language: str = "en"
    # audio_bytes sent as base64 in production; omitted here for brevity


# ---------------------------------------------------------------------------
# REST — text chat
# ---------------------------------------------------------------------------
@router.post("/message")
async def chat_message(req: ChatRequest):
    """Process a single chat message and return a structured response."""
    result = await _engine.process_message(
        user_id=req.user_id,
        message=req.message,
        user_type=req.user_type,
        language=req.language,
        session_id=req.session_id,
    )
    return result


# ---------------------------------------------------------------------------
# REST — voice (text-to-speech response)
# ---------------------------------------------------------------------------
@router.post("/voice/text-to-speech")
async def text_to_speech(text: str, language: str = "en"):
    """Convert text to speech audio bytes (MP3)."""
    audio = _translation.text_to_speech_bytes(text, language)
    if not audio:
        raise HTTPException(status_code=503, detail="TTS service unavailable")
    return Response(content=audio, media_type="audio/mpeg")


# ---------------------------------------------------------------------------
# REST — feedback
# ---------------------------------------------------------------------------
@router.post("/feedback")
async def submit_feedback(req: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """Persist thumbs-up/down feedback for a bot message to the database."""
    feedback = ChatbotFeedback(
        id=uuid.uuid4(),
        message_id=uuid.UUID(req.message_id),
        user_id=uuid.UUID(req.user_id),
        helpful=req.helpful,
        rating=req.rating,
        comment=req.comment,
    )
    db.add(feedback)
    await db.commit()
    logger.info("Feedback saved for message %s: helpful=%s", req.message_id, req.helpful)
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# WebSocket — real-time chat
# ---------------------------------------------------------------------------
@router.websocket("/ws/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time bidirectional chat.
    Client sends: {"message": "...", "user_type": "customer", "language": "en"}
    Server sends: {"type": "typing"|"message", "data": {...}}
    """
    await websocket.accept()
    logger.info("WebSocket connected: user_id=%s", user_id)
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            user_type = data.get("user_type", "customer")
            language = data.get("language", "en")
            session_id = data.get("session_id")

            if not message.strip():
                continue

            # Send typing indicator
            await websocket.send_json({"type": "typing", "is_typing": True})
            await asyncio.sleep(0.4)  # brief simulated thinking delay

            result = await _engine.process_message(
                user_id=user_id,
                message=message,
                user_type=user_type,
                language=language,
                session_id=session_id,
            )

            await websocket.send_json({"type": "typing", "is_typing": False})
            await websocket.send_json({"type": "message", "data": result})

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: user_id=%s", user_id)
    except Exception as exc:
        logger.error("WebSocket error for user %s: %s", user_id, exc)
        await websocket.close(code=1011)


# ---------------------------------------------------------------------------
# Twilio — WhatsApp / SMS webhook
# ---------------------------------------------------------------------------
@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Twilio WhatsApp / SMS inbound webhook.
    Twilio POSTs form-encoded data; we parse it and reply with TwiML.
    """
    try:
        from twilio.twiml.messaging_response import MessagingResponse
    except ImportError:
        raise HTTPException(status_code=503, detail="Twilio not installed")

    form = await request.form()
    from_number: str = form.get("From", "")
    body: str = form.get("Body", "")

    # Derive user_id from phone number (hash in production)
    user_id = from_number.replace("+", "").replace("whatsapp:", "")

    result = await _engine.process_message(
        user_id=user_id,
        message=body,
        user_type="customer",   # WhatsApp defaults to customer; extend as needed
        language="en",
    )

    twiml = MessagingResponse()
    msg = twiml.message()
    msg.body(result["response"])
    return Response(content=str(twiml), media_type="application/xml")


# ---------------------------------------------------------------------------
# Twilio — Voice IVR webhook
# ---------------------------------------------------------------------------
@router.post("/voice/ivr")
async def voice_ivr(request: Request):
    """
    Twilio Voice inbound call webhook — returns TwiML for IVR menu.
    """
    try:
        from twilio.twiml.voice_response import VoiceResponse, Gather
    except ImportError:
        raise HTTPException(status_code=503, detail="Twilio not installed")

    twiml = VoiceResponse()
    gather = Gather(num_digits=1, action="/api/chatbot/voice/menu", method="POST", timeout=5)
    gather.say(
        "Welcome to BlueCollar Job Platform. "
        "For booking a worker, press 1. "
        "For workers, press 2. "
        "For payment help, press 3. "
        "To speak to support, press 0.",
        voice="Polly.Aditi",
        language="en-IN",
    )
    twiml.append(gather)
    twiml.say("We didn't receive your input. Goodbye.")
    return Response(content=str(twiml), media_type="application/xml")


@router.post("/voice/menu")
async def voice_menu(request: Request):
    """Handle IVR digit selection."""
    try:
        from twilio.twiml.voice_response import VoiceResponse
    except ImportError:
        raise HTTPException(status_code=503, detail="Twilio not installed")

    form = await request.form()
    digit = form.get("Digits", "")
    twiml = VoiceResponse()

    menu = {
        "1": "You selected booking a worker. Please hold while we connect you.",
        "2": "You selected worker services. Please hold.",
        "3": "You selected payment help. Please hold.",
        "0": "Connecting you to a support agent. Please hold.",
    }
    twiml.say(menu.get(digit, "Invalid option. Please call again."), voice="Polly.Aditi")
    return Response(content=str(twiml), media_type="application/xml")


# ---------------------------------------------------------------------------
# Twilio — SMS (basic phones / keyword commands)
# ---------------------------------------------------------------------------
@router.post("/sms")
async def sms_webhook(request: Request):
    """
    Twilio SMS inbound webhook.
    Handles keyword commands for basic/feature phones (no smartphone needed).
    """
    try:
        from twilio.twiml.messaging_response import MessagingResponse
    except ImportError:
        raise HTTPException(status_code=503, detail="Twilio not installed")

    form = await request.form()
    from_number: str = form.get("From", "")
    body: str = form.get("Body", "").strip()

    reply_text = _sms.handle(from_number, body)

    twiml = MessagingResponse()
    twiml.message(reply_text)
    return Response(content=str(twiml), media_type="application/xml")
