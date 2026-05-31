"""
Database models for the BlueCollar chatbot system.
Uses SQLAlchemy async ORM with PostgreSQL.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, Text, DateTime,
    ForeignKey, Numeric, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class ChatbotConversation(Base):
    __tablename__ = "chatbot_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    user_type = Column(String(20), nullable=False)  # customer, worker, admin
    channel = Column(String(30), default="web")     # web, whatsapp, telegram, sms, voice
    language = Column(String(10), default="en")
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    message_count = Column(Integer, default=0)
    resolved = Column(Boolean, default=False)
    escalated_to_human = Column(Boolean, default=False)

    messages = relationship("ChatbotMessage", back_populates="conversation", cascade="all, delete-orphan")
    escalations = relationship("ChatbotEscalation", back_populates="conversation", cascade="all, delete-orphan")


class ChatbotMessage(Base):
    __tablename__ = "chatbot_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chatbot_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)        # user, assistant, system
    content = Column(Text, nullable=False)
    intent = Column(String(100), nullable=True)
    confidence = Column(Numeric(5, 4), nullable=True)
    language = Column(String(10), default="en")
    response_time_ms = Column(Integer, nullable=True)
    is_translated = Column(Boolean, default=False)
    original_language = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ChatbotConversation", back_populates="messages")
    feedback = relationship("ChatbotFeedback", back_populates="message", uselist=False)


class ChatbotFeedback(Base):
    __tablename__ = "chatbot_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("chatbot_messages.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    rating = Column(Integer, CheckConstraint("rating >= 1 AND rating <= 5"), nullable=True)
    helpful = Column(Boolean, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("ChatbotMessage", back_populates="feedback")


class ChatbotEscalation(Base):
    __tablename__ = "chatbot_escalations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chatbot_conversations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(String(255), nullable=False)
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    assigned_to = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String(20), default="pending")   # pending, in_progress, resolved
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ChatbotConversation", back_populates="escalations")
