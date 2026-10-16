import bcrypt
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed version using bcrypt directly."""
    if not hashed_password or not plain_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly."""
    # bcrypt.gensalt() defaults to work factor 12
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def generate_secure_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP using secrets module."""
    otp_num = secrets.randbelow(900000) + 100000
    return str(otp_num)

def hash_otp(otp_code: str) -> str:
    """Hash the 6-digit OTP code using SHA-256 with secret salt so plain OTP is never stored in DB."""
    salted = f"{settings.SECRET_KEY}:{otp_code.strip()}"
    return hashlib.sha256(salted.encode('utf-8')).hexdigest()

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """Compare plain OTP against stored hash using constant-time comparison."""
    if not plain_otp or not hashed_otp:
        return False
    computed_hash = hash_otp(plain_otp)
    return secrets.compare_digest(computed_hash, hashed_otp)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generate a JWT access token for a given user ID (subject)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": int(expire.timestamp()),  # exp claim as Unix timestamp
        "sub": str(subject)
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_reset_token(email: str, expires_delta: timedelta = None) -> str:
    """Generate a JWT password-reset token for a given email address."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": email,
        "type": "password_reset"
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_reset_token(token: str) -> Union[str, None]:
    """Verify and decode a password-reset JWT token, returning the user's email if valid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") not in ("password_reset", "password_reset_authorized"):
            return None
        email: str = payload.get("sub")
        return email
    except Exception:
        return None

def create_password_reset_session_token(identifier: str, user_id: Optional[int] = None, expires_delta: timedelta = None) -> str:
    """Generate a signed JWT token authorizing password reset after successful OTP verification."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": identifier,
        "user_id": user_id,
        "type": "password_reset_authorized"
    }
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_password_reset_session_token(token: str) -> Union[dict, None]:
    """Verify password reset session token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "password_reset_authorized":
            return None
        return payload
    except Exception:
        return None

def create_otp_token(identifier: str, otp_code: str, expires_delta: timedelta = None) -> str:
    """Generate a signed OTP verification token storing identifier and OTP hash (legacy compatibility)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    to_encode = {
        "exp": int(expire.timestamp()),
        "sub": identifier,
        "otp": otp_code,
        "type": "phone_otp"
    }
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_otp_token(otp_token: str, input_otp: str) -> Union[str, None]:
    """Verify and decode an OTP verification token (legacy compatibility)."""
    try:
        payload = jwt.decode(otp_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "phone_otp":
            return None
        if str(payload.get("otp")) != str(input_otp).strip():
            return None
        identifier: str = payload.get("sub")
        return identifier
    except Exception:
        return None



