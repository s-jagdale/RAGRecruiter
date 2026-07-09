"""
Authentication helpers — password hashing, JWT creation/verification.
"""

import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import get_user_by_email, get_user_by_id

# ── Config ──────────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "interview-agent-super-secret-key-change-in-prod")
ALGORITHM   = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7   # 7 days

oauth2_scheme  = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# ── Password helpers ────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── JWT helpers ─────────────────────────────────────────────────────────────────

def create_access_token(user_id: int, email: str) -> str:
    expires = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "email": email, "exp": expires}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ── FastAPI dependency ──────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def get_optional_user(token: str = Depends(oauth2_scheme)):
    """Returns user or None — for endpoints that work with or without auth."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    return get_user_by_id(int(payload["sub"]))
