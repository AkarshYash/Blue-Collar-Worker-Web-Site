"""
BlueCollar Chatbot — FastAPI application entry point v2.
Adds: analytics API, auth, conversation history, Prometheus metrics,
      streaming responses, WebSocket broadcast manager.
"""
import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Prometheus metrics (optional)
# ---------------------------------------------------------------------------
def _setup_metrics():
    try:
        from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
        registry = CollectorRegistry()
        return {
            "requests_total": Counter(
                "chatbot_requests_total", "Total chat requests",
                ["user_type", "intent", "channel"], registry=registry,
            ),
            "response_time": Histogram(
                "chatbot_response_seconds", "Response time in seconds",
                registry=registry,
            ),
            "active_sessions": Gauge(
                "chatbot_active_sessions", "Active WebSocket sessions",
                registry=registry,
            ),
            "registry": registry,
        }
    except Exception:
        return None

_metrics = _setup_metrics()


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting BlueCollar Chatbot v2...")

    try:
        from .models.database import create_tables
        await create_tables()
        logger.info("Database tables ready.")
    except Exception as exc:
        logger.warning("DB setup skipped: %s", exc)

    try:
        from .services.rag_service import RAGService
        RAGService().seed_index()
    except Exception as exc:
        logger.warning("RAG seed skipped: %s", exc)

    if os.getenv("TELEGRAM_BOT_TOKEN"):
        try:
            from .services.telegram_bot import start_telegram_bot
            asyncio.create_task(start_telegram_bot())
            logger.info("Telegram bot started.")
        except Exception as exc:
            logger.warning("Telegram bot failed: %s", exc)

    logger.info("✅ BlueCollar Chatbot v2 is running!")
    yield
    logger.info("Shutting down...")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="BlueCollar Chatbot — Sahayak v2",
    description=(
        "Advanced AI-powered multi-lingual chatbot for the BlueCollar job platform. "
        "Features: LLM (Llama 3 70B), RAG, 100+ languages, WebSocket, Twilio, Telegram, "
        "JWT auth, analytics API, Prometheus metrics."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------
def _get_redis():
    try:
        import redis
        client = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True
        )
        client.ping()
        return client
    except Exception:
        return None

from .middleware.rate_limiter import RateLimiterMiddleware
app.add_middleware(RateLimiterMiddleware, redis_client=_get_redis())

# ---------------------------------------------------------------------------
# Request timing middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.monotonic()
    response = await call_next(request)
    elapsed = time.monotonic() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    if _metrics:
        _metrics["response_time"].observe(elapsed)
    return response

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
from .api.chatbot       import router as chatbot_router
from .api.analytics     import router as analytics_router
from .api.auth          import router as auth_router
from .api.conversations import router as conversations_router

app.include_router(chatbot_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(conversations_router)

# ---------------------------------------------------------------------------
# Root & health
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "🤖 Sahayak — BlueCollar Chatbot API v2",
        "author":  "Akarsh Chaturvedi",
        "version": "2.0.0",
        "docs":    "/docs",
        "health":  "/health",
        "metrics": "/metrics",
        "features": [
            "LLM (Llama 3 70B via Groq)",
            "RAG (Pinecone vector search)",
            "100+ language translation",
            "WebSocket real-time chat",
            "Twilio WhatsApp/SMS/Voice",
            "Telegram bot",
            "JWT authentication",
            "Analytics API",
            "Prometheus metrics",
            "Content moderation + PII masking",
        ],
    }


@app.get("/health", tags=["Health"])
async def health():
    checks: dict = {"status": "ok", "service": "bluecollar-chatbot", "version": "2.0.0"}

    # DB check
    try:
        from .models.database import engine
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc}"

    # Redis check
    try:
        import redis
        r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        r.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "unavailable (using in-memory fallback)"

    # LLM check
    checks["llm"] = "configured" if os.getenv("GROQ_API_KEY") else "not configured (rule-based fallback)"
    checks["rag"] = "configured" if os.getenv("PINECONE_API_KEY") else "not configured (keyword fallback)"

    overall = "ok" if checks["database"] == "ok" else "degraded"
    checks["status"] = overall
    return checks


@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint."""
    if not _metrics:
        return JSONResponse({"error": "prometheus_client not installed"}, status_code=503)
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        data = generate_latest(_metrics["registry"])
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=500)


@app.get("/api/config", tags=["Config"])
async def public_config():
    """Return non-sensitive public configuration for the frontend."""
    return {
        "version":          "2.0.0",
        "features": {
            "llm":          bool(os.getenv("GROQ_API_KEY")),
            "rag":          bool(os.getenv("PINECONE_API_KEY")),
            "telegram":     bool(os.getenv("TELEGRAM_BOT_TOKEN")),
            "twilio":       bool(os.getenv("TWILIO_ACCOUNT_SID")),
            "redis":        bool(os.getenv("REDIS_URL")),
        },
        "supported_languages": [
            "en", "hi", "ta", "te", "mr", "bn", "gu", "kn", "ml", "pa",
            "or", "as", "ur", "ne", "si", "my", "th", "id", "ms", "ar",
        ],
        "channels": ["web", "whatsapp", "sms", "telegram", "voice"],
    }
    

