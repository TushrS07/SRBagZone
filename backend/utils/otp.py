"""
One-time-password helpers.

Codes are 6-digit numeric, never stored in plaintext — we persist an HMAC
(keyed by JWT_SECRET) so a database leak doesn't expose live codes. Verification
uses a constant-time compare.
"""
import hashlib
import hmac
import secrets
from config import settings


def generate_code() -> str:
    """A random 6-digit code, zero-padded (e.g. '004217')."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_code(code: str) -> str:
    return hmac.new(settings.jwt_secret.encode(), code.encode(), hashlib.sha256).hexdigest()


def verify_code(code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_code(code), code_hash)
