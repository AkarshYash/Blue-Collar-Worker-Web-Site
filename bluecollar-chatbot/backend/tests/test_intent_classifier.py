"""
Unit tests for IntentClassifier and ContentModerator.
Run with: pytest tests/ -v
"""
import pytest
from app.services.intent_classifier import IntentClassifier
from app.services.moderation import ContentModerator


@pytest.fixture
def classifier():
    return IntentClassifier()


@pytest.fixture
def moderator():
    return ContentModerator()


# ---------------------------------------------------------------------------
# Intent classification
# ---------------------------------------------------------------------------
class TestIntentClassifier:

    def test_search_workers(self, classifier):
        result = classifier.classify("I need a plumber near me", "customer")
        assert result.action == "search_workers"
        assert result.entities.get("skill") == "plumber"

    def test_book_worker(self, classifier):
        result = classifier.classify("Book Rajesh for tomorrow 10 AM", "customer")
        assert result.action == "book_worker"
        assert result.entities.get("date") == "tomorrow"
        assert result.entities.get("time") is not None

    def test_track_order(self, classifier):
        result = classifier.classify("Where is my worker? He's late", "customer")
        assert result.action == "track_order"

    def test_payment_query(self, classifier):
        result = classifier.classify("My refund isn't showing", "customer")
        assert result.action == "payment_query"

    def test_dispute(self, classifier):
        result = classifier.classify("The worker did poor quality work", "customer")
        assert result.action == "dispute"

    def test_worker_onboarding(self, classifier):
        result = classifier.classify("How to get verified?", "worker")
        assert result.action == "worker_onboarding"

    def test_find_jobs_worker(self, classifier):
        result = classifier.classify("Show me jobs near me", "worker")
        assert result.action == "find_jobs_worker"

    def test_earnings_query(self, classifier):
        result = classifier.classify("How much did I earn today?", "worker")
        assert result.action == "earnings_query"

    def test_platform_analytics(self, classifier):
        result = classifier.classify("Show me platform metrics", "admin")
        assert result.action == "platform_analytics"

    def test_fraud_alerts(self, classifier):
        result = classifier.classify("Show suspicious activities", "admin")
        assert result.action == "fraud_alerts"

    def test_greeting(self, classifier):
        result = classifier.classify("Hello!", "customer")
        assert result.action == "greeting"

    def test_help(self, classifier):
        result = classifier.classify("What can you do?", "customer")
        assert result.action == "help"

    def test_amount_extraction(self, classifier):
        result = classifier.classify("Withdraw ₹1500 to UPI", "worker")
        assert result.entities.get("amount") == 1500

    def test_booking_id_extraction(self, classifier):
        result = classifier.classify("Check booking BLR-240115-001", "customer")
        assert result.entities.get("booking_id") == "BLR-240115-001"

    def test_dispute_id_extraction(self, classifier):
        result = classifier.classify("Review DSP-001", "admin")
        assert result.entities.get("dispute_id") == "DSP-001"

    def test_unknown_falls_back(self, classifier):
        result = classifier.classify("xyzzy frobnicator", "customer")
        assert result.action == "general_chat"
        assert result.confidence < 0.9


# ---------------------------------------------------------------------------
# Content moderation
# ---------------------------------------------------------------------------
class TestContentModerator:

    def test_clean_message_allowed(self, moderator):
        result = moderator.check("I need a plumber near me")
        assert result.allowed is True

    def test_profanity_blocked(self, moderator):
        result = moderator.check("This is fucking terrible service")
        assert result.allowed is False
        assert result.reason == "profanity"

    def test_harmful_intent_blocked(self, moderator):
        result = moderator.check("how to make a bomb")
        assert result.allowed is False
        assert result.reason == "harmful_intent"

    def test_aadhaar_masked(self, moderator):
        result = moderator.check("My Aadhaar is 123456789012")
        assert result.allowed is True
        assert "123456789012" not in result.sanitized
        assert "[AADHAAR_NUMBER]" in result.sanitized

    def test_pan_masked(self, moderator):
        result = moderator.check("My PAN is ABCDE1234F")
        assert result.allowed is True
        assert "ABCDE1234F" not in result.sanitized
        assert "[PAN_NUMBER]" in result.sanitized

    def test_card_number_masked(self, moderator):
        result = moderator.check("Card number 4111111111111111")
        assert result.allowed is True
        assert "4111111111111111" not in result.sanitized
