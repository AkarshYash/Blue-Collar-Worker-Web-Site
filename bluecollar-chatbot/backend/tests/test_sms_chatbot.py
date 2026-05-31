"""
Unit tests for SMS keyword-command chatbot.
"""
import pytest
from app.services.sms_chatbot import SMSChatbot


@pytest.fixture
def sms():
    return SMSChatbot()


def test_help_command(sms):
    reply = sms.handle("+919876543210", "HELP")
    assert "SEARCH" in reply
    assert "BALANCE" in reply
    assert "JOBS" in reply


def test_search_command(sms):
    reply = sms.handle("+919876543210", "SEARCH plumber")
    assert "plumber" in reply.lower() or "Plumber" in reply
    assert "BOOK" in reply


def test_balance_command(sms):
    reply = sms.handle("+919876543210", "BALANCE")
    assert "balance" in reply.lower() or "Rs" in reply


def test_jobs_command(sms):
    reply = sms.handle("+919876543210", "JOBS")
    assert "ACCEPT" in reply


def test_earn_command(sms):
    reply = sms.handle("+919876543210", "EARN")
    assert "earning" in reply.lower() or "Rs" in reply


def test_unknown_command(sms):
    reply = sms.handle("+919876543210", "FOOBAR")
    assert "HELP" in reply


def test_case_insensitive(sms):
    reply = sms.handle("+919876543210", "help")
    assert "SEARCH" in reply


def test_track_command(sms):
    reply = sms.handle("+919876543210", "TRACK")
    assert "ETA" in reply or "km" in reply


def test_cancel_command(sms):
    reply = sms.handle("+919876543210", "CANCEL")
    assert "cancel" in reply.lower() or "refund" in reply.lower()
