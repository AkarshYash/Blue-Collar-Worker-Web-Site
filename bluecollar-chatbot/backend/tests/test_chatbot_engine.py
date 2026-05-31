"""
Integration tests for ChatbotEngine (no external services required).
Run with: pytest tests/ -v
"""
import pytest
import asyncio
from app.services.chatbot_engine import ChatbotEngine


@pytest.fixture(scope="module")
def engine():
    return ChatbotEngine()


@pytest.mark.asyncio
async def test_customer_search(engine):
    result = await engine.process_message(
        user_id="test-user-1",
        message="I need a plumber near me",
        user_type="customer",
    )
    assert "plumber" in result["response"].lower() or "worker" in result["response"].lower()
    assert result["intent"] == "search_workers"
    assert result["session_id"] is not None
    assert result["response_time_ms"] >= 0


@pytest.mark.asyncio
async def test_worker_jobs(engine):
    result = await engine.process_message(
        user_id="test-worker-1",
        message="Show me available jobs",
        user_type="worker",
    )
    assert result["intent"] == "find_jobs_worker"
    assert len(result["response"]) > 0


@pytest.mark.asyncio
async def test_admin_analytics(engine):
    result = await engine.process_message(
        user_id="test-admin-1",
        message="Show me platform metrics",
        user_type="admin",
    )
    assert result["intent"] == "platform_analytics"
    assert "GMV" in result["response"] or "growth" in result["response"].lower()


@pytest.mark.asyncio
async def test_moderation_blocks_harmful(engine):
    result = await engine.process_message(
        user_id="test-user-2",
        message="how to make a bomb",
        user_type="customer",
    )
    assert result["intent"] == "blocked"


@pytest.mark.asyncio
async def test_session_persistence(engine):
    uid = "test-session-user"
    sid = "test-session-123"
    # First message
    await engine.process_message(
        user_id=uid, message="hello", user_type="customer", session_id=sid
    )
    # Second message — session should be loaded
    result = await engine.process_message(
        user_id=uid, message="find me a plumber", user_type="customer", session_id=sid
    )
    assert result["session_id"] == sid


@pytest.mark.asyncio
async def test_quick_replies_present(engine):
    result = await engine.process_message(
        user_id="test-user-3",
        message="help",
        user_type="customer",
    )
    assert isinstance(result.get("quick_replies"), list)
    assert isinstance(result.get("suggested_actions"), list)
