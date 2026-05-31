"""
Action handlers — each handler maps to a chatbot intent and returns a
structured response dict consumed by the chatbot engine.
"""
from __future__ import annotations
import random
from typing import Any


def _resp(text: str, actions: list[str] | None = None, quick_replies: list[dict] | None = None) -> dict:
    return {
        "response": text,
        "suggested_actions": actions or [],
        "quick_replies": quick_replies or [],
        "should_speak": True,
    }


# ---------------------------------------------------------------------------
# Customer handlers
# ---------------------------------------------------------------------------

class SearchWorkersHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        skill = entities.get("skill", "worker")
        urgency = entities.get("urgency", "medium")
        # In production: query DB / search service
        workers = [
            {"name": "Rajesh Kumar", "rating": 4.8, "price": 500, "distance": "800m", "id": "W-45001"},
            {"name": "Suresh Mehta",  "rating": 4.9, "price": 450, "distance": "1.2km", "id": "W-45002"},
            {"name": "Amit Singh",    "rating": 4.7, "price": 400, "distance": "2.3km", "id": "W-45003"},
        ]
        lines = [f"📍 I found {len(workers)} {skill}s near your location.\n\n🛠️ Top matches:"]
        for i, w in enumerate(workers, 1):
            lines.append(f"{i}. {w['name']} — ⭐{w['rating']}, ₹{w['price']}/hr, {w['distance']} away")
        lines.append("\nWould you like me to:")
        text = "\n".join(lines)
        return _resp(
            text,
            actions=["Show all results", "Filter by price", "Filter by rating"],
            quick_replies=[
                {"title": f"Book {workers[0]['name']}", "payload": f"book {workers[0]['id']}"},
                {"title": "Tell me more", "payload": "more details"},
            ],
        )


class BookingHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        date = entities.get("date", "tomorrow")
        time = entities.get("time", "10:00 AM")
        text = (
            f"📅 Booking request created:\n\n"
            f"🛠️ Worker: Rajesh Kumar (Plumber)\n"
            f"📍 Your location: Sector 62, Noida\n"
            f"🕐 Date: {date.capitalize()}, {time}\n"
            f"💰 Estimated cost: ₹500\n"
            f"💳 Advance required: ₹100\n\n"
            f"Payment methods:\n"
            f"1. UPI (GPay, PhonePe, Paytm, Amazon Pay, BHIM, WhatsApp Pay)\n"
            f"2. Credit/Debit Card (Visa, Mastercard)\n"
            f"3. Wallet balance\n\n"
            f"Reply with 'PAY' to proceed or 'CANCEL' to modify."
        )
        return _resp(text, quick_replies=[
            {"title": "PAY", "payload": "pay advance"},
            {"title": "CANCEL", "payload": "cancel booking"},
        ])


class TrackOrderHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "📍 Tracking Rajesh:\n"
            "• Current location: 1.2km away\n"
            "• ETA: 8 minutes\n"
            "• Status: Stuck in mild traffic\n\n"
            "💬 I've messaged him to update you."
        )
        return _resp(text, quick_replies=[
            {"title": "Call Rajesh", "payload": "call worker"},
            {"title": "Reschedule", "payload": "reschedule booking"},
            {"title": "Cancel", "payload": "cancel booking"},
        ])


class PaymentHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "💰 Refund status for your recent booking:\n\n"
            "• Advance paid: ₹100\n"
            "• Cancellation: Customer initiated (2 hours before)\n"
            "• Refund amount: ₹50 (50% policy)\n"
            "• Status: Processed to your UPI ID\n"
            "• Expected: 2-3 business days\n\n"
            "Need the transaction ID or want to escalate to support?"
        )
        return _resp(text, quick_replies=[
            {"title": "Get Transaction ID", "payload": "transaction id"},
            {"title": "Escalate to Support", "payload": "escalate"},
        ])


class DisputeHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "😟 I'm sorry to hear that. Let me help.\n\n"
            "Please describe the issue:\n"
            "• What work was done?\n"
            "• What's wrong with it?\n"
            "• Do you have photos/videos?\n\n"
            "Based on your response, I can:\n"
            "1. Connect you with dispute resolution team\n"
            "2. Hold remaining payment\n"
            "3. Request worker to revisit free of cost\n"
            "4. Initiate refund process"
        )
        return _resp(text, quick_replies=[
            {"title": "Upload Photos", "payload": "upload evidence"},
            {"title": "Request Revisit", "payload": "request revisit"},
            {"title": "Initiate Refund", "payload": "initiate refund"},
        ])


# ---------------------------------------------------------------------------
# Worker handlers
# ---------------------------------------------------------------------------

class OnboardingHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "🔐 Verification levels and benefits:\n\n"
            "Level 1 (Basic) ⚪\n→ Upload Aadhaar + Selfie\n→ Benefit: Jobs up to ₹500\n\n"
            "Level 2 (ID Verified) 🟢\n→ PAN card + Address proof\n→ Benefit: ₹5,000 job limit\n\n"
            "Level 3 (Skill Tested) 🟣\n→ Online quiz + Video demo\n→ Benefit: Unlimited jobs, +30% visibility\n\n"
            "Level 4 (Background Check) 🔴\n→ Police clearance certificate\n→ Benefit: Trusted badge, higher rates\n\n"
            "Which level would you like to start with?"
        )
        return _resp(text, quick_replies=[
            {"title": "Level 1 — Basic", "payload": "L1"},
            {"title": "Level 2 — ID", "payload": "L2"},
            {"title": "Level 3 — Skill", "payload": "L3"},
        ])


class FindJobsWorkerHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "📍 Jobs within 5km of your location:\n\n"
            "1. 🔧 Leakage repair — ₹500\n   Customer: Anjali (2.3km) | Urgency: High | Within 2 hours\n\n"
            "2. ⚡ Fan installation — ₹300\n   Customer: Raj (1.8km) | Urgency: Medium | Today 6 PM\n\n"
            "3. 🚿 Bathroom plumbing — ₹1,200\n   Customer: Priya (3.1km) | Urgency: Low | Tomorrow 10 AM\n\n"
            "💡 AI Suggestion: Job #1 is best match (98% relevance). Accept within 60 secs for priority!"
        )
        return _resp(text, quick_replies=[
            {"title": "Accept Job 1", "payload": "accept job 1"},
            {"title": "Accept Job 2", "payload": "accept job 2"},
            {"title": "Accept Job 3", "payload": "accept job 3"},
        ])


class AcceptJobHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "✅ Job accepted! Customer notified.\n\n"
            "📱 Customer: Anjali — 98765XXXXX\n"
            "📍 Address: C-204, Green Park Main\n"
            "🗺️ Live location shared\n\n"
            "💡 Tips:\n"
            "• Call customer before leaving\n"
            "• Bring pipe fitting tools\n"
            "• Estimated travel: 12 mins\n\n"
            "Would you like me to navigate you there?"
        )
        return _resp(text, quick_replies=[
            {"title": "Open Navigation", "payload": "navigate"},
            {"title": "Call Customer", "payload": "call customer"},
        ])


class EarningsHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "💰 Today's earnings:\n\n"
            "Completed jobs: 4\n"
            "─────────────────────\n"
            "1. Leakage repair:   ₹500\n"
            "2. Fan installation: ₹300\n"
            "3. Pipe fitting:     ₹400\n"
            "4. Bathroom repair:  ₹600\n"
            "─────────────────────\n"
            "Total:               ₹1,800\n"
            "Platform commission (15%): -₹270\n"
            "Net earnings:        ₹1,530\n\n"
            "💳 Wallet balance: ₹4,200\n\n"
            "Withdrawal options:\n"
            "1. Bank transfer (free, 2-3 hrs)\n"
            "2. UPI instant (2% fee)\n"
            "3. Cash pickup (1% fee)"
        )
        return _resp(text, quick_replies=[
            {"title": "Withdraw to UPI", "payload": "withdraw upi"},
            {"title": "Bank Transfer", "payload": "withdraw bank"},
        ])


class AvailabilityHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        date = entities.get("date", "tomorrow")
        text = (
            f"📅 Setting unavailable for {date}:\n\n"
            "Want to mark as:\n"
            "1. Full day unavailable\n"
            "2. Only specific hours\n"
            "3. Emergency only (extra pay)\n\n"
            "⚠️ Emergency mode: ₹750/hour (+50% surge)"
        )
        return _resp(text, quick_replies=[
            {"title": "Full Day Off", "payload": "full day unavailable"},
            {"title": "Emergency Only", "payload": "set emergency only"},
            {"title": "Set Hours", "payload": "set specific hours"},
        ])


class PerformanceHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "📊 Rating analysis for last 7 days:\n\n"
            "Current rating: 4.5 ⭐ (down from 4.8)\n\n"
            "Category breakdown:\n"
            "✓ Quality of work:  4.9 (excellent)\n"
            "⚠️ Punctuality:     3.8 (needs improvement)\n"
            "✓ Communication:   4.2 (good)\n"
            "✓ Value for money: 4.6 (good)\n\n"
            "💡 Recommendations:\n"
            "1. Enable 'Live Location' to show accurate ETA\n"
            "2. Use navigation to avoid traffic delays\n"
            "3. Message customers if you're running late"
        )
        return _resp(text, quick_replies=[
            {"title": "Punctuality Tips", "payload": "improve punctuality"},
            {"title": "View Reviews", "payload": "view reviews"},
        ])


# ---------------------------------------------------------------------------
# Admin handlers
# ---------------------------------------------------------------------------

class AnalyticsHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "📈 BlueCollar Platform Dashboard (Last 7 days):\n\n"
            "🚀 Growth:\n"
            "• New customers: +2,340\n"
            "• New workers:   +890\n"
            "• Total jobs:    15,670 (+23% MoM)\n"
            "• GMV:           ₹2.34 Cr (+31% MoM)\n\n"
            "⚠️ Alerts:\n"
            "• Disputes pending:          45 (needs review)\n"
            "• High-risk workers flagged: 12\n"
            "• Payment failures:          3.2% (above threshold)\n\n"
            "🎯 Top performing cities:\n"
            "1. Mumbai    — ₹45L GMV\n"
            "2. Delhi     — ₹38L GMV\n"
            "3. Bangalore — ₹32L GMV"
        )
        return _resp(text, quick_replies=[
            {"title": "View Alerts", "payload": "show alerts"},
            {"title": "Export Report", "payload": "export report"},
            {"title": "Deeper Metrics", "payload": "detailed metrics"},
        ])


class VerifyWorkerHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        worker_id = entities.get("worker_id")
        if worker_id:
            text = (
                f"🆔 Verification request — {worker_id}:\n\n"
                "Level 3 Skill Test\n"
                "• Quiz score: 92%\n"
                "• Video demo: Submitted\n"
                "• Documents: Verified\n\n"
                "Action: APPROVE or REJECT?"
            )
            return _resp(text, quick_replies=[
                {"title": f"Approve {worker_id}", "payload": f"approve {worker_id}"},
                {"title": f"Reject {worker_id}", "payload": f"reject {worker_id}"},
            ])
        text = (
            "🆔 Verification requests pending (156):\n\n"
            "Level 1 (Basic):      45 waiting\n"
            "Level 2 (ID):         78 waiting\n"
            "Level 3 (Skill):      23 waiting\n"
            "Level 4 (Background): 10 waiting\n\n"
            "⏰ Oldest pending: 3 days (Level 2)\n\n"
            "Reply 'VERIFY W-XXXXX' to process a specific worker."
        )
        return _resp(text, quick_replies=[
            {"title": "Review Level 2 Queue", "payload": "verify level 2"},
            {"title": "Review Level 3 Queue", "payload": "verify level 3"},
        ])


class FraudAlertsHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        text = (
            "🚨 Fraud Detection Alerts (Last 24h):\n\n"
            "🔴 High Risk (7):\n"
            "1. Worker #W-44512 — Fake reviews detected\n"
            "   Pattern: 5 five-star reviews in 10 minutes\n"
            "   Action: Auto-suspended\n\n"
            "2. Customer #C-23451 — Multiple cancellations\n"
            "   15 bookings, 13 cancelled (87% rate)\n"
            "   Action: Payment method flagged\n\n"
            "🟡 Medium Risk (23): Location spoofing, unusual device patterns\n"
            "🟢 Low Risk (45): Pending manual review"
        )
        return _resp(text, quick_replies=[
            {"title": "Resolve W-44512", "payload": "resolve W-44512"},
            {"title": "Review Medium Risk", "payload": "medium risk alerts"},
        ])


class ResolveDisputeHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        dispute_id = entities.get("dispute_id")
        if dispute_id:
            text = (
                f"📋 Dispute {dispute_id} Details:\n\n"
                "🧑 Customer: Anjali Sharma\n"
                "🔧 Worker: Rajesh Kumar\n"
                "💰 Amount: ₹500 (advance paid)\n\n"
                "Customer: 'Worker didn't complete the job properly. Pipe still leaking.'\n"
                "Worker: 'I fixed the leak. Customer is disputing unfairly.'\n\n"
                "📸 Evidence: 3 photos attached\n\n"
                "Options:\n"
                "1. Release payment to worker\n"
                "2. Refund customer (full/partial)\n"
                "3. Request more evidence\n"
                "4. Offer free revisit"
            )
            return _resp(text, quick_replies=[
                {"title": "Release Payment", "payload": "release payment"},
                {"title": "Full Refund", "payload": "full refund"},
                {"title": "Partial Refund", "payload": "partial refund"},
                {"title": "Request Evidence", "payload": "request evidence"},
            ])
        text = (
            "⚖️ Pending disputes (45):\n\n"
            "High priority (24+ hours old): 12\n\n"
            "1. #DSP-001 — Customer: ₹500 refund request | Jan 14, 3:30 PM\n"
            "2. #DSP-002 — Worker: Payment not released | Jan 14, 6:15 PM\n"
            "3. #DSP-003 — Safety complaint | Jan 15, 9:00 AM\n\n"
            "Reply 'REVIEW DSP-XXX' to open a specific dispute."
        )
        return _resp(text, quick_replies=[
            {"title": "Review DSP-001", "payload": "review DSP-001"},
            {"title": "Review DSP-002", "payload": "review DSP-002"},
            {"title": "Review DSP-003", "payload": "review DSP-003"},
        ])


# ---------------------------------------------------------------------------
# Universal handlers
# ---------------------------------------------------------------------------

class HelpHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        user_type = context.get("user_type", "customer")
        if user_type == "worker":
            text = (
                "🤖 I'm Sahayak — your BlueCollar assistant!\n\n"
                "I can help you with:\n"
                "• 🔍 Find jobs near you\n"
                "• ✅ Accept / manage bookings\n"
                "• 💰 Check earnings & withdraw\n"
                "• 📅 Set your availability\n"
                "• 🆔 Verification & onboarding\n"
                "• 📊 View your performance\n\n"
                "Just type what you need!"
            )
        elif user_type == "admin":
            text = (
                "🤖 Admin Assistant — Sahayak\n\n"
                "Available commands:\n"
                "• 📈 Platform metrics & analytics\n"
                "• ⚖️ Dispute management\n"
                "• 🆔 Worker verification queue\n"
                "• 🚨 Fraud detection alerts\n"
                "• 📞 Customer escalations\n\n"
                "Type a command or ask a question."
            )
        else:
            text = (
                "👋 Hi! I'm Sahayak — your BlueCollar assistant!\n\n"
                "I can help you:\n"
                "• 🔍 Find skilled workers near you\n"
                "• 📅 Book & track services\n"
                "• 💳 Handle payments & refunds\n"
                "• ⚖️ Resolve disputes\n"
                "• 🌐 Communicate in 100+ languages\n\n"
                "What do you need today?"
            )
        return _resp(text)


class GreetingHandler:
    async def execute(self, user_id: str, entities: dict, context: dict) -> dict:
        greetings = [
            "👋 Hello! How can I help you today?",
            "🙏 Namaste! What can I do for you?",
            "Hi there! I'm Sahayak. What do you need?",
        ]
        return _resp(random.choice(greetings), quick_replies=[
            {"title": "Find a Worker", "payload": "find worker"},
            {"title": "My Bookings", "payload": "my bookings"},
            {"title": "Help", "payload": "help"},
        ])


# ---------------------------------------------------------------------------
# Handler registry
# ---------------------------------------------------------------------------
ACTION_HANDLERS: dict[str, Any] = {
    # Customer
    "search_workers":    SearchWorkersHandler(),
    "book_worker":       BookingHandler(),
    "track_order":       TrackOrderHandler(),
    "payment_query":     PaymentHandler(),
    "dispute":           DisputeHandler(),
    # Worker
    "worker_onboarding": OnboardingHandler(),
    "find_jobs_worker":  FindJobsWorkerHandler(),
    "accept_job":        AcceptJobHandler(),
    "earnings_query":    EarningsHandler(),
    "set_availability":  AvailabilityHandler(),
    "performance_query": PerformanceHandler(),
    # Admin
    "platform_analytics": AnalyticsHandler(),
    "verify_worker":      VerifyWorkerHandler(),
    "fraud_alerts":       FraudAlertsHandler(),
    "resolve_dispute":    ResolveDisputeHandler(),
    # Universal
    "help":     HelpHandler(),
    "greeting": GreetingHandler(),
}
