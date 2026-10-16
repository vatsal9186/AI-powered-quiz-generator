from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_avatar: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: str

class ForgotPasswordRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None

class SendOTPRequest(BaseModel):
    method: Optional[str] = "sms"  # "sms" or "email"
    phone_number: Optional[str] = None
    identifier: Optional[str] = None  # Accepts phone_number, identifier, or email
    email: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    reference_id: Optional[str] = None
    otp_token: Optional[str] = None   # Backwards compatibility alias
    otp_code: str

class SendOTPResponse(BaseModel):
    message: str
    reference_id: str
    sent: bool = True
    provider: Optional[str] = None
    channel: Optional[str] = "SMS"
    expires_in_seconds: int = 300
    resend_cooldown_seconds: int = 60

class VerifyOTPResponse(BaseModel):
    message: str
    reset_token: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None

class ResetPasswordResponse(BaseModel):
    message: str



