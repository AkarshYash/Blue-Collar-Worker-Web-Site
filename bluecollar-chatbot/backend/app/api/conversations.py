"""
Conversation history API — retrieve stored conversations and messages.
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_db
from ..models.db_models import ChatbotConversation, ChatbotMessage

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("/")
async def list_conversations(
    user_id:   Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    channel:   Optional[str] = Query(None),
    limit:     int           = Query(20, le=100),
    offset:    int           = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List conversations with optional filters."""
    try:
        q = select(ChatbotConversation).order_by(ChatbotConversation.start_time.desc())
        if user_id:
            q = q.where(ChatbotConversation.user_id == uuid.UUID(user_id))
        if user_type:
            q = q.where(ChatbotConversation.user_type == user_type)
        if channel:
            q = q.where(ChatbotConversation.channel == channel)
        q = q.offset(offset).limit(limit)
        result = await db.execute(q)
        convs  = result.scalars().all()
        return [
            {
                "id":            str(c.id),
                "user_id":       str(c.user_id),
                "session_id":    c.session_id,
                "user_type":     c.user_type,
                "channel":       c.channel,
                "language":      c.language,
                "message_count": c.message_count,
                "resolved":      c.resolved,
                "escalated":     c.escalated_to_human,
                "start_time":    c.start_time.isoformat() if c.start_time else None,
                "end_time":      c.end_time.isoformat() if c.end_time else None,
            }
            for c in convs
        ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Get all messages for a conversation."""
    try:
        result = await db.execute(
            select(ChatbotMessage)
            .where(ChatbotMessage.conversation_id == uuid.UUID(conversation_id))
            .order_by(ChatbotMessage.created_at.asc())
        )
        msgs = result.scalars().all()
        return [
            {
                "id":              str(m.id),
                "role":            m.role,
                "content":         m.content,
                "intent":          m.intent,
                "confidence":      float(m.confidence) if m.confidence else None,
                "language":        m.language,
                "response_time_ms":m.response_time_ms,
                "is_translated":   m.is_translated,
                "created_at":      m.created_at.isoformat() if m.created_at else None,
            }
            for m in msgs
        ]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
