"""
Rate limiting middleware — 100 requests/minute per user (by IP or user_id header).
Uses Redis sliding window counter; falls back to in-process dict when Redis is down.
"""
from __future__ import annotations

import time
import logging
from collections import defaultdict

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

RATE_LIMIT = 100        # max requests
WINDOW_SEC = 60         # per minute
BURST_LIMIT = 20        # max requests per 5 seconds (burst protection)
BURST_WINDOW = 5


class _InMemoryStore:
    """Fallback counter store when Redis is unavailable."""
    def __init__(self):
        self._data: dict[str, list[float]] = defaultdict(list)

    def get_count(self, key: str, window: int) -> int:
        now = time.time()
        self._data[key] = [t for t in self._data[key] if now - t < window]
        return len(self._data[key])

    def add(self, key: str):
        self._data[key].append(time.time())


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self._redis = redis_client
        self._fallback = _InMemoryStore()

    async def dispatch(self, request: Request, call_next) -> Response:
        # Only rate-limit chatbot endpoints
        if not request.url.path.startswith("/api/chatbot"):
            return await call_next(request)

        # Identify caller: prefer X-User-ID header, fall back to IP
        user_key = (
            request.headers.get("X-User-ID")
            or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.client.host
        )

        # Check rate limits
        if self._is_rate_limited(user_key):
            logger.warning("Rate limit exceeded for key: %s", user_key)
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "Too many requests. Please wait a moment and try again.",
                    "retry_after": WINDOW_SEC,
                },
                headers={"Retry-After": str(WINDOW_SEC)},
            )

        response = await call_next(request)
        return response

    def _is_rate_limited(self, key: str) -> bool:
        minute_key = f"rl:min:{key}"
        burst_key  = f"rl:burst:{key}"

        if self._redis:
            try:
                return self._redis_check(minute_key, burst_key)
            except Exception as exc:
                logger.warning("Redis rate-limit check failed: %s — using fallback.", exc)

        # In-memory fallback
        if self._fallback.get_count(minute_key, WINDOW_SEC) >= RATE_LIMIT:
            return True
        if self._fallback.get_count(burst_key, BURST_WINDOW) >= BURST_LIMIT:
            return True
        self._fallback.add(minute_key)
        self._fallback.add(burst_key)
        return False

    def _redis_check(self, minute_key: str, burst_key: str) -> bool:
        pipe = self._redis.pipeline()
        now = int(time.time() * 1000)

        for key, window_ms, limit in [
            (minute_key, WINDOW_SEC * 1000, RATE_LIMIT),
            (burst_key,  BURST_WINDOW * 1000, BURST_LIMIT),
        ]:
            pipe.zremrangebyscore(key, 0, now - window_ms)
            pipe.zcard(key)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, WINDOW_SEC + 1)

        results = pipe.execute()
        # zcard results are at indices 1 and 5
        minute_count = results[1]
        burst_count  = results[5]
        return minute_count >= RATE_LIMIT or burst_count >= BURST_LIMIT
