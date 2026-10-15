from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.orm import Session

from .models import LoginThrottle

PBKDF2_ITERATIONS = 390_000
MAX_PASSWORD_CHARACTERS = 1024


def hash_password(password: str) -> str:
    if not isinstance(password, str) or len(password) > MAX_PASSWORD_CHARACTERS:
        raise ValueError(f"La contraseña no puede superar {MAX_PASSWORD_CHARACTERS:,} caracteres.")
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${digest.hex()}"


# Used only to keep missing/inactive-account login failures on the PBKDF2 path.
LOGIN_DUMMY_PASSWORD_HASH = hash_password("RED-invalid-login-probe-never-a-user-password")


def verify_password(password: str, encoded: str) -> bool:
    # Bound attacker-controlled input before UTF-8 encoding and the costly PBKDF2 call.
    if not isinstance(password, str) or len(password) > MAX_PASSWORD_CHARACTERS:
        return False
    try:
        algorithm, rounds, salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("ascii"), int(rounds)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def purge_expired_login_throttles(session: Session, *, now: datetime | None = None) -> int:
    cutoff = (now or datetime.now(timezone.utc)) - timedelta(hours=24)
    result = session.execute(delete(LoginThrottle).where(LoginThrottle.window_start < cutoff))
    removed = max(result.rowcount or 0, 0)
    if removed:
        session.commit()
    return removed
