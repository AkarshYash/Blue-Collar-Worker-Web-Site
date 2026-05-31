"""
Content moderation — blocks harmful, abusive, or PII-leaking inputs
before they reach the LLM or action handlers.
"""
import re
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Blocked patterns
# ---------------------------------------------------------------------------
_PROFANITY = [
    r"\bfuck\b", r"\bshit\b", r"\bbitch\b", r"\basshole\b",
    r"\bchutiya\b", r"\bmadarc\w+\b", r"\bbhenc\w+\b",   # Hindi abuses
]

_HARMFUL_INTENT = [
    r"how to (make|build|create).*(bomb|weapon|explosive|poison)",
    r"(kill|murder|harm|attack)\s+(someone|a person|the worker|customer)",
    r"(hack|crack|exploit)\s+(the|this)\s+(system|platform|app|database)",
    r"(steal|fraud|scam|cheat)\s+(money|payment|wallet)",
]

_PII_PATTERNS = [
    (r"\b\d{12}\b",                    "AADHAAR_NUMBER"),   # 12-digit Aadhaar
    (r"\b[A-Z]{5}\d{4}[A-Z]\b",       "PAN_NUMBER"),       # PAN card
    (r"\b\d{16}\b",                    "CARD_NUMBER"),      # 16-digit card
    (r"\b\d{9,18}\b",                  "BANK_ACCOUNT"),     # bank account
    (r"\b\d{3}-\d{2}-\d{4}\b",        "SSN"),              # SSN (global users)
]

_COMPILED_PROFANITY    = [re.compile(p, re.IGNORECASE) for p in _PROFANITY]
_COMPILED_HARMFUL      = [re.compile(p, re.IGNORECASE) for p in _HARMFUL_INTENT]
_COMPILED_PII          = [(re.compile(p), label) for p, label in _PII_PATTERNS]


class ModerationResult:
    def __init__(self, allowed: bool, reason: str = "", sanitized: str = ""):
        self.allowed = allowed
        self.reason = reason
        self.sanitized = sanitized  # message with PII masked


class ContentModerator:

    def check(self, message: str) -> ModerationResult:
        # 1. Harmful intent — hard block
        for pattern in _COMPILED_HARMFUL:
            if pattern.search(message):
                logger.warning("Harmful content blocked: %r", message[:80])
                return ModerationResult(
                    allowed=False,
                    reason="harmful_intent",
                    sanitized=message,
                )

        # 2. Profanity — soft block with warning
        for pattern in _COMPILED_PROFANITY:
            if pattern.search(message):
                logger.info("Profanity detected in message.")
                return ModerationResult(
                    allowed=False,
                    reason="profanity",
                    sanitized=message,
                )

        # 3. PII — mask and allow
        sanitized = message
        for pattern, label in _COMPILED_PII:
            sanitized = pattern.sub(f"[{label}]", sanitized)

        return ModerationResult(allowed=True, sanitized=sanitized)

    def blocked_response(self, reason: str) -> str:
        if reason == "harmful_intent":
            return (
                "⚠️ I can't help with that request.\n"
                "If you need assistance, please contact support."
            )
        if reason == "profanity":
            return (
                "Please keep the conversation respectful. "
                "I'm here to help — just ask nicely! 🙏"
            )
        return "I'm unable to process that message. Please try again."
