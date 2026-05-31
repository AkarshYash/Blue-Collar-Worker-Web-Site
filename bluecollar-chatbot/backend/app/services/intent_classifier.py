"""
Intent classification and entity extraction for the BlueCollar chatbot.
Maps user messages to structured intents with extracted entities.
"""
import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ClassifiedIntent:
    action: str
    confidence: float
    entities: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Intent keyword map — ordered from most specific to most general
# ---------------------------------------------------------------------------
INTENT_PATTERNS: list[tuple[str, list[str]]] = [
    # --- Customer intents ---
    ("dispute",           ["poor quality", "bad work", "didn't complete", "overcharged", "complaint", "refund request", "dispute"]),
    ("track_order",       ["where is", "track", "how far", "eta", "late", "not arrived"]),
    ("payment_query",     ["refund", "payment failed", "wallet balance", "transaction", "money deducted", "not credited"]),
    ("book_worker",       ["book", "schedule", "appointment", "hire", "confirm booking"]),
    ("search_workers",    ["find", "need a", "looking for", "show me", "plumber", "electrician", "carpenter",
                           "cleaner", "painter", "mechanic", "gardener", "majdur", "worker near"]),
    # --- Worker intents ---
    ("worker_onboarding", ["how to register", "become a", "worker signup", "verification", "get verified", "documents"]),
    ("accept_job",        ["accept job", "i'll take", "confirm job", "take this job"]),
    ("find_jobs_worker",  ["show available jobs", "new requests", "jobs near me", "any work today", "available jobs"]),
    ("earnings_query",    ["how much earned", "withdraw", "payment pending", "commission", "my earnings", "today's earning"]),
    ("set_availability",  ["not available", "vacation mode", "emergency only", "working hours", "off tomorrow", "unavailable"]),
    ("performance_query", ["my rating", "rating dropped", "reviews", "performance", "feedback received"]),
    # --- Admin intents ---
    ("platform_analytics",["show me metrics", "platform performance", "total users", "revenue report", "dashboard"]),
    ("verify_worker",     ["pending verifications", "approve worker", "verify documents", "verification queue"]),
    ("fraud_alerts",      ["suspicious activity", "fake reviews", "flagged users", "fraud", "suspicious"]),
    ("resolve_dispute",   ["pending disputes", "customer complaint", "worker issue", "review dispute"]),
    # --- Universal ---
    ("help",              ["help", "what can you do", "commands", "menu", "options"]),
    ("greeting",          ["hi", "hello", "hey", "namaste", "good morning", "good evening"]),
]

SKILLS = ["plumber", "electrician", "carpenter", "cleaner", "painter",
          "mechanic", "gardener", "majdur", "cook", "driver", "security"]

URGENCY_KEYWORDS = {
    "high":   ["urgent", "emergency", "asap", "immediately", "right now", "today"],
    "medium": ["soon", "today", "this evening", "this afternoon"],
    "low":    ["tomorrow", "next week", "whenever", "flexible"],
}


class IntentClassifier:
    """Rule-based intent classifier with entity extraction."""

    def classify(self, message: str, user_type: str) -> ClassifiedIntent:
        msg_lower = message.lower()

        for action, keywords in INTENT_PATTERNS:
            for kw in keywords:
                if kw in msg_lower:
                    entities = self._extract_entities(msg_lower, action)
                    return ClassifiedIntent(action=action, confidence=0.92, entities=entities)

        # Fallback
        return ClassifiedIntent(action="general_chat", confidence=0.5, entities={})

    # ------------------------------------------------------------------
    def _extract_entities(self, msg: str, action: str) -> dict:
        entities: dict = {}

        # Skill
        for skill in SKILLS:
            if skill in msg:
                entities["skill"] = skill
                break

        # Amount / price
        price_match = re.search(r"[₹rs\.]\s*(\d+)", msg) or re.search(r"(\d+)\s*(rupee|rs)", msg)
        if price_match:
            entities["amount"] = int(price_match.group(1))

        # Date
        if "tomorrow" in msg:
            entities["date"] = "tomorrow"
        elif "today" in msg:
            entities["date"] = "today"
        elif "next week" in msg:
            entities["date"] = "next_week"

        # Time  e.g. "10 am", "6:30 pm"
        time_match = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm))", msg)
        if time_match:
            entities["time"] = time_match.group(1)

        # Urgency
        for level, kws in URGENCY_KEYWORDS.items():
            if any(k in msg for k in kws):
                entities["urgency"] = level
                break

        # Booking / dispute / worker IDs
        booking_match = re.search(r"#?(blr-\d{6}-\d{3}|bk-\d+)", msg)
        if booking_match:
            entities["booking_id"] = booking_match.group(1).upper()

        dispute_match = re.search(r"#?(dsp-\d{3,})", msg)
        if dispute_match:
            entities["dispute_id"] = dispute_match.group(1).upper()

        worker_match = re.search(r"#?(w-\d{4,})", msg)
        if worker_match:
            entities["worker_id"] = worker_match.group(1).upper()

        return entities
