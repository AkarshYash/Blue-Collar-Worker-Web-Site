"""Initial chatbot schema

Revision ID: 0001
Revises:
Create Date: 2026-05-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "chatbot_conversations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False, index=True),
        sa.Column("session_id", sa.String(255), nullable=False, index=True),
        sa.Column("user_type", sa.String(20), nullable=False),
        sa.Column("channel", sa.String(30), server_default="web"),
        sa.Column("language", sa.String(10), server_default="en"),
        sa.Column("start_time", sa.DateTime, server_default=sa.func.now()),
        sa.Column("end_time", sa.DateTime, nullable=True),
        sa.Column("message_count", sa.Integer, server_default="0"),
        sa.Column("resolved", sa.Boolean, server_default="false"),
        sa.Column("escalated_to_human", sa.Boolean, server_default="false"),
    )

    op.create_table(
        "chatbot_messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", UUID(as_uuid=True),
                  sa.ForeignKey("chatbot_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("intent", sa.String(100), nullable=True),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("language", sa.String(10), server_default="en"),
        sa.Column("response_time_ms", sa.Integer, nullable=True),
        sa.Column("is_translated", sa.Boolean, server_default="false"),
        sa.Column("original_language", sa.String(10), nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "chatbot_feedback",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("message_id", UUID(as_uuid=True),
                  sa.ForeignKey("chatbot_messages.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("rating", sa.Integer, sa.CheckConstraint("rating >= 1 AND rating <= 5"), nullable=True),
        sa.Column("helpful", sa.Boolean, nullable=True),
        sa.Column("comment", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "chatbot_escalations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", UUID(as_uuid=True),
                  sa.ForeignKey("chatbot_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.String(255), nullable=False),
        sa.Column("priority", sa.String(20), server_default="medium"),
        sa.Column("assigned_to", UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("resolved_at", sa.DateTime, nullable=True),
        sa.Column("resolution_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    # Indexes for common queries
    op.create_index("ix_messages_conversation_id", "chatbot_messages", ["conversation_id"])
    op.create_index("ix_messages_created_at", "chatbot_messages", ["created_at"])
    op.create_index("ix_escalations_status", "chatbot_escalations", ["status"])


def downgrade():
    op.drop_table("chatbot_escalations")
    op.drop_table("chatbot_feedback")
    op.drop_table("chatbot_messages")
    op.drop_table("chatbot_conversations")
