"""
SMS chatbot for basic/feature phones.
Keyword-command driven (no NLP needed — works on 2G).
Registered as a Twilio SMS webhook at POST /api/chatbot/sms
"""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# Command → (description, handler_key)
SMS_COMMANDS: dict[str, str] = {
    "HELP":     "help",
    "SEARCH":   "search",
    "BOOK":     "book",
    "TRACK":    "track",
    "BALANCE":  "balance",
    "WITHDRAW": "withdraw",
    "JOBS":     "jobs",
    "ACCEPT":   "accept",
    "EARN":     "earn",
    "CANCEL":   "cancel",
    "STATUS":   "status",
    "RATE":     "rate",
}

HELP_TEXT = (
    "BlueCollar SMS Bot\n"
    "Commands:\n"
    "SEARCH <skill> - Find workers\n"
    "BOOK <id> - Book a worker\n"
    "TRACK - Track your booking\n"
    "BALANCE - Wallet balance\n"
    "WITHDRAW <amt> - Withdraw money\n"
    "JOBS - Available jobs (workers)\n"
    "ACCEPT <id> - Accept a job\n"
    "EARN - Today's earnings\n"
    "STATUS - Booking status\n"
    "CANCEL - Cancel booking\n"
    "RATE <id> <1-5> - Rate a worker"
)


class SMSChatbot:
    """
    Stateless SMS handler. Each incoming SMS is parsed into a command + args
    and a short reply (≤160 chars where possible) is returned.
    """

    def handle(self, from_number: str, body: str) -> str:
        body = body.strip().upper()
        parts = body.split(maxsplit=1)
        command = parts[0] if parts else ""
        args = parts[1] if len(parts) > 1 else ""

        handler = SMS_COMMANDS.get(command)
        if not handler:
            return (
                "Unknown command. Reply HELP for list of commands.\n"
                "BlueCollar Platform"
            )

        method = getattr(self, f"_cmd_{handler}", None)
        if method:
            return method(from_number, args)
        return "Command not available. Reply HELP."

    # ── Command handlers ─────────────────────────────────────────────────────

    def _cmd_help(self, phone: str, args: str) -> str:
        return HELP_TEXT

    def _cmd_search(self, phone: str, args: str) -> str:
        skill = args.strip().title() or "Worker"
        # In production: query DB for nearby workers
        return (
            f"Found 3 {skill}s near you:\n"
            "1. Rajesh-4.8*-Rs500/hr\n"
            "2. Suresh-4.9*-Rs450/hr\n"
            "3. Amit-4.7*-Rs400/hr\n"
            "Reply BOOK W-45001 to hire #1"
        )

    def _cmd_book(self, phone: str, args: str) -> str:
        worker_id = args.strip() or "W-XXXXX"
        return (
            f"Booking {worker_id}.\n"
            "Advance: Rs100\n"
            "Pay via UPI: bluecollar@upi\n"
            "Reply CONFIRM after payment."
        )

    def _cmd_track(self, phone: str, args: str) -> str:
        return (
            "Your worker Rajesh:\n"
            "Location: 1.2km away\n"
            "ETA: 8 minutes\n"
            "Call: 98765XXXXX"
        )

    def _cmd_balance(self, phone: str, args: str) -> str:
        # In production: fetch from DB by phone number
        return "Wallet balance: Rs4,200\nReply WITHDRAW <amount> to cash out."

    def _cmd_withdraw(self, phone: str, args: str) -> str:
        amount = args.strip() or "0"
        return (
            f"Withdrawal Rs{amount} initiated.\n"
            "Method: UPI\n"
            "Fee: 2%\n"
            "ETA: Instant-5 mins"
        )

    def _cmd_jobs(self, phone: str, args: str) -> str:
        return (
            "Jobs near you:\n"
            "1. Leakage repair-Rs500-2.3km\n"
            "2. Fan install-Rs300-1.8km\n"
            "3. Plumbing-Rs1200-3.1km\n"
            "Reply ACCEPT 1 to take job #1"
        )

    def _cmd_accept(self, phone: str, args: str) -> str:
        job_num = args.strip() or "?"
        return (
            f"Job #{job_num} accepted!\n"
            "Customer: Anjali\n"
            "Address sent via SMS.\n"
            "Call customer: 98765XXXXX"
        )

    def _cmd_earn(self, phone: str, args: str) -> str:
        return (
            "Today's earnings:\n"
            "Jobs: 4 | Total: Rs1800\n"
            "Commission(15%): -Rs270\n"
            "Net: Rs1530\n"
            "Reply WITHDRAW to cash out."
        )

    def _cmd_cancel(self, phone: str, args: str) -> str:
        return (
            "Booking cancelled.\n"
            "Refund: Rs50 (50% policy)\n"
            "Credited in 2-3 business days."
        )

    def _cmd_status(self, phone: str, args: str) -> str:
        return (
            "Booking #BLR-240115-001\n"
            "Worker: Rajesh Kumar\n"
            "Status: En route\n"
            "ETA: 8 minutes"
        )

    def _cmd_rate(self, phone: str, args: str) -> str:
        parts = args.split()
        worker_id = parts[0] if parts else "?"
        rating = parts[1] if len(parts) > 1 else "?"
        return f"Rating {rating}* submitted for {worker_id}. Thank you!"
