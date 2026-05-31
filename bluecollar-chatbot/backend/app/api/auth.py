"""
JWT authentication endpoints.
POST /api/auth/login  → returns access_token
GET  /api/auth/me     → returns current user info
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])
bearer = HTTPBearer(auto_error=False)

SECRET_KEY  = os.getenv("JWT_SECRET", "sahayak-dev-secret-change-in-production")
ALGORITHM   = "HS256"
TOKEN_TTL   = 60 * 24  # 24 hours in minutes

# Demo users (replace with DB lookup in production)
DEMO_USERS = {
    "admin@bluecollar.in": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Admin User",
        "email": "admin@bluecollar.in",
        "role": "admin",
        "password": "admin123",  # NEVER store plain text in production
    },
    "demo@bluecollar.in": {
        "id": "00000000-0000-0000-0000-000000000002",
        "name": "Demo User",
        "email": "demo@bluecollar.in",
        "role": "customer",
        "password": "demo123",
    },
}


def _create_token(data: dict) -> str:
    try:
        from jose import jwt
        payload = {**data, "exp": datetime.utcnow() + timedelta(minutes=TOKEN_TTL)}
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except ImportError:
        # Fallback: return a simple base64 token if python-jose not installed
        import base64, json
        return base64.b64encode(json.dumps(data).encode()).decode()


def _decode_token(token: str) -> Optional[dict]:
    try:
        from jose import jwt, JWTError
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        try:
            import base64, json
            return json.loads(base64.b64decode(token).decode())
        except Exception:
            return None


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    user = DEMO_USERS.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token_data = {"sub": user["id"], "email": user["email"], "role": user["role"]}
    token = _create_token(token_data)
    return LoginResponse(
        access_token=token,
        user={k: v for k, v in user.items() if k != "password"},
    )


@router.get("/me")
async def me(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = _decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload.get("email")
    user  = DEMO_USERS.get(email, {})
    return {k: v for k, v in user.items() if k != "password"}


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> dict:
    """Dependency — use in protected routes."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = _decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload
