"""
Core chatbot engine — orchestrates intent classification, action dispatch,
LLM fallback (Groq / Llama 3), session memory (Redis), and translation.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import time
import uuid
from typing import Any

from .intent_classifier import IntentClassifier
from .translation_service import TranslationService
from .action_handlers import ACTION_HANDLERS
from .moderation import ContentModerator
from .rag_service import RAGService

logger = logging.getLogger(__name__)


def _is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except (ValueError, AttributeError):
        return False

# ---------------------------------------------------------------------------
# Optional LLM (Groq + LangChain) — graceful fallback if not configured
# ---------------------------------------------------------------------------
def _build_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(model="llama3-70b-8192", temperature=0.3, groq_api_key=api_key)
    except Exception as exc:
        logger.warning("LLM init failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Redis session store — graceful fallback to in-process dict
# ---------------------------------------------------------------------------
class _MemoryStore:
    """In-process fallback when Redis is unavailable."""
    def __init__(self):
        self._store: dict[str, str] = {}

    def get(self, key: str) -> str | None:
        return self._store.get(key)

    def setex(self, key: str, ttl: int, value: str):
        self._store[key] = value

    def delete(self, key: str):
        self._store.pop(key, None)


def _build_redis():
    url = os.getenv("REDIS_URL", "redis://localhost:6379")
    try:
        import redis
        client = redis.from_url(url, decode_responses=True)
        client.ping()
        logger.info("Redis connected at %s", url)
        return client
    except Exception as exc:
        logger.warning("Redis unavailable (%s) — using in-process memory store.", exc)
        return _MemoryStore()


# ---------------------------------------------------------------------------
# Chatbot Engine
# ---------------------------------------------------------------------------
SESSION_TTL = 1800  # 30 minutes


class ChatbotEngine:
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.translation_service = TranslationService()
        self.moderator = ContentModerator()
        self.rag = RAGService()
        self.llm = _build_llm()
        self.session_store = _build_redis()

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------
    async def process_message(
        self,
        user_id: str,
        message: str,
        user_type: str,
        language: str = "en",
        session_id: str | None = None,
    ) -> dict[str, Any]:
        start = time.monotonic()
        session_id = session_id or str(uuid.uuid4())

        # 1. Detect language if not provided
        detected_lang = self.translation_service.detect_language(message)
        working_lang = detected_lang if detected_lang != "en" else language

        # 2. Translate to English for NLP
        english_message = (
            self.translation_service.translate(message, "en", working_lang)
            if working_lang != "en"
            else message
        )

        # 3. Content moderation
        mod = self.moderator.check(english_message)
        if not mod.allowed:
            blocked_text = self.moderator.blocked_response(mod.reason)
            if working_lang not in ("en", ""):
                blocked_text = self.translation_service.translate(blocked_text, working_lang, "en")
            return {
                "response": blocked_text,
                "suggested_actions": [],
                "quick_replies": [],
                "should_speak": True,
                "session_id": session_id,
                "intent": "blocked",
                "confidence": 1.0,
                "response_time_ms": int((time.monotonic() - start) * 1000),
                "detected_language": working_lang,
            }
        english_message = mod.sanitized  # use PII-masked version

        # 4. Load session context
        context = self._load_session(session_id, user_id, user_type)

        # 5. Classify intent
        classified = self.intent_classifier.classify(english_message, user_type)

        # 6. Dispatch to handler or LLM fallback
        handler = ACTION_HANDLERS.get(classified.action)
        if handler:
            result = await handler.execute(user_id, classified.entities, context)
        else:
            rag_context = self.rag.build_context(english_message)
            result = await self._llm_fallback(english_message, context, rag_context)

        # 7. Translate response back to user's language
        if working_lang not in ("en", ""):
            result["response"] = self.translation_service.translate(
                result["response"], working_lang, "en"
            )

        # 8. Save session
        self._save_session(session_id, user_id, user_type, message, result["response"])

        # 9. Persist to DB (fire-and-forget, safe even if no event loop task support)
        elapsed_ms_pre = int((time.monotonic() - start) * 1000)
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(self._persist_message(
                    session_id=session_id,
                    user_id=user_id,
                    user_type=user_type,
                    channel="web",
                    language=working_lang,
                    user_msg=message,
                    bot_msg=result["response"],
                    intent=classified.action,
                    confidence=classified.confidence,
                    response_time_ms=elapsed_ms_pre,
                ))
        except Exception as _persist_exc:
            logger.debug("DB persist task skipped: %s", _persist_exc)

        # 10. Attach metadata
        elapsed_ms = int((time.monotonic() - start) * 1000)
        result.update({
            "session_id": session_id,
            "intent": classified.action,
            "confidence": classified.confidence,
            "response_time_ms": elapsed_ms,
            "detected_language": working_lang,
        })
        return result

    # ------------------------------------------------------------------
    # LLM fallback for unrecognised intents
    # ------------------------------------------------------------------
    async def _llm_fallback(self, message: str, context: dict, rag_context: str | None = None) -> dict:
        if self.llm:
            try:
                history = context.get("history", [])
                history_text = "\n".join(
                    f"{m['role'].capitalize()}: {m['content']}" for m in history[-6:]
                )
                rag_section = f"\n\n{rag_context}" if rag_context else ""
                system_prompt = (
                    "You are Sahayak, a helpful AI assistant for the BlueCollar job platform. "
                    "You help customers find workers, workers find jobs, and admins manage the platform. "
                    "Be concise, friendly, and culturally aware. "
                    f"Always respond in the same language the user wrote in.{rag_section}"
                )
                full_prompt = f"{system_prompt}\n\n{history_text}\nUser: {message}\nSahayak:"
                response = self.llm.invoke(full_prompt)
                return {
                    "response": response.content,
                    "suggested_actions": [],
                    "quick_replies": [],
                    "should_speak": True,
                }
            except Exception as exc:
                logger.error("LLM fallback error: %s", exc)

        return {
            "response": (
                "I'm not sure I understood that. Could you rephrase?\n\n"
                "You can ask me to:\n"
                "• Find workers near you\n"
                "• Check your bookings\n"
                "• Help with payments\n"
                "• Resolve disputes\n\n"
                "Type 'HELP' for the full menu."
            ),
            "suggested_actions": ["Find Workers", "My Bookings", "Help"],
            "quick_replies": [{"title": "Help", "payload": "help"}],
            "should_speak": True,
        }

    # ------------------------------------------------------------------
    # DB persistence (fire-and-forget, never blocks the response)
    # ------------------------------------------------------------------
    async def _persist_message(
        self,
        session_id: str,
        user_id: str,
        user_type: str,
        channel: str,
        language: str,
        user_msg: str,
        bot_msg: str,
        intent: str,
        confidence: float,
        response_time_ms: int,
    ):
        """Persist conversation + messages to the database asynchronously."""
        try:
            from ..models.database import AsyncSessionLocal
            from ..models.db_models import ChatbotConversation, ChatbotMessage
            import uuid as _uuid

            async with AsyncSessionLocal() as db:
                # Upsert conversation
                from sqlalchemy import select
                result = await db.execute(
                    select(ChatbotConversation).where(
                        ChatbotConversation.session_id == session_id
                    )
                )
                conv = result.scalar_one_or_none()
                if not conv:
                    conv = ChatbotConversation(
                        id=_uuid.uuid4(),
                        user_id=_uuid.UUID(user_id) if _is_valid_uuid(user_id) else _uuid.uuid4(),
                        session_id=session_id,
                        user_type=user_type,
                        channel=channel,
                        language=language,
                    )
                    db.add(conv)
                    await db.flush()

                conv.message_count = (conv.message_count or 0) + 2

                # User message
                db.add(ChatbotMessage(
                    id=_uuid.uuid4(),
                    conversation_id=conv.id,
                    role="user",
                    content=user_msg,
                    language=language,
                ))
                # Bot message
                db.add(ChatbotMessage(
                    id=_uuid.uuid4(),
                    conversation_id=conv.id,
                    role="assistant",
                    content=bot_msg,
                    intent=intent,
                    confidence=confidence,
                    response_time_ms=response_time_ms,
                    language=language,
                ))
                await db.commit()
        except Exception as exc:
            logger.debug("DB persist skipped: %s", exc)

    # ------------------------------------------------------------------
    # Session helpers
    # ------------------------------------------------------------------
    def _session_key(self, session_id: str) -> str:
        return f"chatbot:session:{session_id}"

    def _load_session(self, session_id: str, user_id: str, user_type: str) -> dict:
        raw = self.session_store.get(self._session_key(session_id))
        if raw:
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                pass
        return {"user_id": user_id, "user_type": user_type, "history": []}

    def _save_session(
        self, session_id: str, user_id: str, user_type: str, user_msg: str, bot_msg: str
    ):
        context = self._load_session(session_id, user_id, user_type)
        history: list = context.setdefault("history", [])
        history.append({"role": "user", "content": user_msg})
        history.append({"role": "assistant", "content": bot_msg})
        # Keep last 20 turns to avoid bloat
        context["history"] = history[-40:]
        self.session_store.setex(
            self._session_key(session_id), SESSION_TTL, json.dumps(context)
        )
