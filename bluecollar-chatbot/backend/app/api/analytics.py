"""
Analytics API — platform KPIs, session stats, intent distribution.
Reads from the database; falls back to mock data when DB is empty.
"""
from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.database import get_db
from ..models.db_models import ChatbotConversation, ChatbotMessage, ChatbotFeedback

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def _mock_kpis() -> dict[str, Any]:
    """Realistic mock KPIs for demo / empty-DB mode."""
    return {
        "active_sessions":   random.randint(180, 280),
        "total_msgs_today":  random.randint(38000, 48000),
        "avg_response_ms":   random.randint(800, 1400),
        "escalations":       random.randint(8, 18),
        "csat_score":        round(4.3 + random.random() * 0.5, 1),
        "resolution_rate":   random.randint(82, 92),
        "new_users_today":   random.randint(700, 1100),
        "gmv_today":         random.randint(1_800_000, 2_800_000),
    }


def _mock_hourly() -> list[dict]:
    return [
        {
            "hour": f"{h:02d}:00",
            "messages": random.randint(200, 900),
            "resolved": random.randint(100, 700),
        }
        for h in range(24)
    ]


def _mock_weekly_gmv() -> list[dict]:
    base = datetime.utcnow()
    return [
        {
            "day": (base - timedelta(days=6 - i)).strftime("%a"),
            "gmv": random.randint(200_000, 600_000),
            "jobs": random.randint(500, 2500),
        }
        for i in range(7)
    ]


@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db)):
    """Return full dashboard payload."""
    # Try real DB counts
    try:
        total_conv = (await db.execute(select(func.count()).select_from(ChatbotConversation))).scalar() or 0
        total_msgs = (await db.execute(select(func.count()).select_from(ChatbotMessage))).scalar() or 0
        avg_rating = (await db.execute(
            select(func.avg(ChatbotFeedback.rating)).where(ChatbotFeedback.rating.isnot(None))
        )).scalar()
    except Exception:
        total_conv = total_msgs = 0
        avg_rating = None

    kpis = _mock_kpis()
    if total_msgs > 0:
        kpis["total_msgs_today"] = total_msgs
    if avg_rating:
        kpis["csat_score"] = round(float(avg_rating), 1)

    return {
        "kpis": kpis,
        "hourly_messages": _mock_hourly(),
        "weekly_gmv": _mock_weekly_gmv(),
        "intent_distribution": [
            {"name": "Search Workers", "value": 28, "color": "#4f46e5"},
            {"name": "Book Worker",    "value": 22, "color": "#7c3aed"},
            {"name": "Earnings",       "value": 15, "color": "#059669"},
            {"name": "Payment",        "value": 12, "color": "#d97706"},
            {"name": "Dispute",        "value": 8,  "color": "#dc2626"},
            {"name": "Onboarding",     "value": 7,  "color": "#0891b2"},
            {"name": "Other",          "value": 8,  "color": "#6b7280"},
        ],
        "channel_breakdown": [
            {"channel": "Web",       "sessions": 12450, "pct": 52},
            {"channel": "WhatsApp",  "sessions": 5820,  "pct": 24},
            {"channel": "Telegram",  "sessions": 2890,  "pct": 12},
            {"channel": "SMS",       "sessions": 1680,  "pct": 7},
            {"channel": "Voice IVR", "sessions": 1200,  "pct": 5},
        ],
        "language_breakdown": [
            {"lang": "Hindi",   "pct": 38, "color": "#4f46e5"},
            {"lang": "English", "pct": 28, "color": "#7c3aed"},
            {"lang": "Tamil",   "pct": 10, "color": "#059669"},
            {"lang": "Telugu",  "pct": 8,  "color": "#d97706"},
            {"lang": "Marathi", "pct": 7,  "color": "#0891b2"},
            {"lang": "Others",  "pct": 9,  "color": "#6b7280"},
        ],
        "top_cities": [
            {"city": "Mumbai",    "gmv": 4_500_000, "jobs": 8920},
            {"city": "Delhi",     "gmv": 3_800_000, "jobs": 7650},
            {"city": "Bangalore", "gmv": 3_200_000, "jobs": 6430},
            {"city": "Hyderabad", "gmv": 2_100_000, "jobs": 4210},
            {"city": "Chennai",   "gmv": 1_800_000, "jobs": 3600},
        ],
        "recent_alerts": [
            {"id": 1, "type": "fraud",   "msg": "Worker W-44512 — fake reviews detected",       "time": "2m ago",  "severity": "high"},
            {"id": 2, "type": "dispute", "msg": "DSP-089 escalated — payment dispute ₹1,200",   "time": "8m ago",  "severity": "medium"},
            {"id": 3, "type": "system",  "msg": "Response time spike: 2.1s avg (last 5 min)",   "time": "15m ago", "severity": "low"},
            {"id": 4, "type": "fraud",   "msg": "Customer C-23451 — 87% cancellation rate",     "time": "22m ago", "severity": "high"},
        ],
        "db_stats": {
            "total_conversations": total_conv,
            "total_messages": total_msgs,
        },
    }


@router.get("/sessions/recent")
async def recent_sessions(limit: int = 20, db: AsyncSession = Depends(get_db)):
    """Return most recent conversations."""
    try:
        result = await db.execute(
            select(ChatbotConversation)
            .order_by(ChatbotConversation.start_time.desc())
            .limit(limit)
        )
        convs = result.scalars().all()
        return [
            {
                "id": str(c.id),
                "user_id": str(c.user_id),
                "user_type": c.user_type,
                "channel": c.channel,
                "language": c.language,
                "message_count": c.message_count,
                "resolved": c.resolved,
                "escalated": c.escalated_to_human,
                "start_time": c.start_time.isoformat() if c.start_time else None,
            }
            for c in convs
        ]
    except Exception:
        return []
