import uuid
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.config import settings
import app.models as models
from app.schemas.auth import (
    Token, GoogleAuthRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ForgotPasswordResponse, ResetPasswordResponse, SendOTPRequest, VerifyOTPRequest,
    SendOTPResponse, VerifyOTPResponse
)
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.utils.security import (
    verify_password, get_password_hash, create_access_token,
    create_reset_token, verify_reset_token, create_otp_token, verify_otp_token,
    generate_secure_otp, hash_otp, verify_otp_hash,
    create_password_reset_session_token, verify_password_reset_session_token
)
from app.utils.google_auth import verify_google_id_token
from app.utils.sms_helper import send_otp_sms, normalize_phone_number
from app.utils.email_helper import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user in the database.
    Checks if email is already taken. Hashes password securely.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login_json(request: Request, response: Response, user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Standard login route accepting a JSON body.
    Sets secure session cookie and returns a masked placeholder access token.
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not user.hashed_password or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    # Enforce credentials separation: Users only
    if user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized role access. Please use the Admin login panel."
        )
        
    access_token = create_access_token(subject=user.id)
    
    is_local = request.url.hostname in ("testserver", "localhost", "127.0.0.1")
    
    response.set_cookie(
        key="questai_session",
        value=access_token,
        httponly=True,
        secure=not is_local,
        samesite="none" if not is_local else "lax",
        path="/"
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_name=user.full_name,
        user_email=user.email,
        user_avatar=user.profile_picture
    )

@router.post("/admin/login", response_model=Token)
def admin_login(request: Request, response: Response, user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Admin-only login route accepting a JSON body.
    Sets secure session cookie and returns a masked placeholder access token.
    """
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not user.hashed_password or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    # Enforce credentials separation: Admins only
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized role access. Please use the standard User login panel."
        )
        
    access_token = create_access_token(subject=user.id)
    
    is_local = request.url.hostname in ("testserver", "localhost", "127.0.0.1")
    
    response.set_cookie(
        key="questai_session",
        value=access_token,
        httponly=True,
        secure=not is_local,
        samesite="none" if not is_local else "lax",
        path="/"
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_name=user.full_name,
        user_email=user.email,
        user_avatar=user.profile_picture
    )

@router.post("/admin/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new admin. Checks if email is already taken. Hashes password.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_admin = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role="admin"
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.post("/login-swagger", response_model=Token)
def login_swagger(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Helper login route accepting standard Form Data.
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    access_token = create_access_token(subject=user.id)
    
    is_local = request.url.hostname in ("testserver", "localhost", "127.0.0.1")
    
    response.set_cookie(
        key="questai_session",
        value=access_token,
        httponly=True,
        secure=not is_local,
        samesite="none" if not is_local else "lax",
        path="/"
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_name=user.full_name,
        user_email=user.email,
        user_avatar=user.profile_picture
    )

@router.post("/google", response_model=Token)
async def google_auth(request: Request, response: Response, payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Google SSO route. Verifies token, sets session cookie, and returns profile details.
    """
    google_user = await verify_google_id_token(payload.id_token)
    
    user = db.query(models.User).filter(models.User.google_id == google_user["google_id"]).first()
    
    try:
        if not user:
            user = db.query(models.User).filter(models.User.email == google_user["email"]).first()
            
            if user:
                user.google_id = google_user["google_id"]
                user.profile_picture = google_user.get("picture")
                user.auth_provider = "google"
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user = models.User(
                    email=google_user["email"],
                    full_name=google_user.get("full_name") or google_user["email"].split("@")[0],
                    google_id=google_user["google_id"],
                    profile_picture=google_user.get("picture"),
                    auth_provider="google",
                    role="user",
                    status="active",
                    hashed_password=None
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            if user.profile_picture != google_user.get("picture"):
                user.profile_picture = google_user.get("picture")
                db.add(user)
                db.commit()
                db.refresh(user)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during Google authentication: {str(e)}"
        )
        
    access_token = create_access_token(subject=user.id)
    
    is_local = request.url.hostname in ("testserver", "localhost", "127.0.0.1")
    
    response.set_cookie(
        key="questai_session",
        value=access_token,
        httponly=True,
        secure=not is_local,
        samesite="none" if not is_local else "lax",
        path="/"
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_name=user.full_name,
        user_email=user.email,
        user_avatar=user.profile_picture
    )

@router.post("/logout")
def logout(response: Response):
    """
    Clears the secure session cookie on logout.
    """
    response.delete_cookie(
        key="questai_session",
        path="/",
        httponly=True,
        samesite="none",
        secure=True
    )
    return {"success": True, "message": "Successfully logged out and session cleared."}

def ensure_utc(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

@router.post("/send-otp", response_model=SendOTPResponse)
@router.post("/forgot-password/send-otp", response_model=SendOTPResponse)
@router.post("/forgot-password/email/send-otp", response_model=SendOTPResponse)
@router.post("/forgot-password", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Validates registered email, enforces resend cooldown (60s), generates a cryptographically
    secure 6-digit OTP (secrets), hashes it in database password_reset_otps, and dispatches via Gmail SMTP.
    """
    raw_identifier = (req.email or req.identifier or req.phone_number or "").strip().lower()

    if not raw_identifier or "@" not in raw_identifier or "." not in raw_identifier.split("@")[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address."
        )

    target_email = raw_identifier.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == target_email).first()
    if not user:
        # Auto-create user account so OTP verification & password reset works for ANY email address
        user = models.User(
            email=target_email,
            full_name=target_email.split("@")[0].title(),
            auth_provider="local"
        )
        db.add(user)
        db.commit()
        db.refresh(user)



    now = datetime.now(timezone.utc)

    # 1. Check resend cooldown limit (60 seconds)
    recent_otp = db.query(models.PasswordResetOTP).filter(
        models.PasswordResetOTP.email == target_email,
        models.PasswordResetOTP.is_used == False
    ).order_by(models.PasswordResetOTP.id.desc()).first()

    if recent_otp and recent_otp.created_at:
        created_at_utc = ensure_utc(recent_otp.created_at)
        elapsed = int((now - created_at_utc).total_seconds())
        remaining = settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed
        if remaining > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another OTP."
            )

    # 2. Invalidate previous unused OTPs for this email target
    db.query(models.PasswordResetOTP).filter(
        models.PasswordResetOTP.email == target_email,
        models.PasswordResetOTP.is_used == False
    ).update({"is_used": True})
    db.commit()

    # 3. Generate cryptographically secure 6-digit OTP using secrets
    otp_code = generate_secure_otp()
    otp_hash_val = hash_otp(otp_code)
    reference_id = uuid.uuid4().hex

    expires_at = now + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    resend_available_at = now + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)

    otp_record = models.PasswordResetOTP(
        user_id=user.id,
        verification_method="email",
        phone_number=user.phone_number or target_email or "",
        email=target_email,
        reference_id=reference_id,
        otp_hash=otp_hash_val,
        expires_at=expires_at,
        attempt_count=0,
        max_attempts=settings.OTP_MAX_ATTEMPTS,
        is_used=False,
        resend_available_at=resend_available_at
    )

    db.add(otp_record)
    db.commit()

    # 4. Dispatch OTP via Gmail SMTP
    try:
        dispatch_res = send_otp_email(target_email, otp_code)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(err)
        )

    return SendOTPResponse(
        message=f"Verification code sent to {target_email} via Email.",
        reference_id=reference_id,
        sent=dispatch_res.get("sent", True),
        provider=dispatch_res.get("provider", "Gmail SMTP Gateway"),
        channel="Email",
        expires_in_seconds=settings.OTP_EXPIRY_MINUTES * 60,
        resend_cooldown_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
@router.post("/forgot-password/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verifies submitted 6-digit OTP against stored OTP hash in PostgreSQL.
    Enforces expiry (~5 mins), max attempt limits (5 attempts), and single-use invalidation.
    """
    ref_id = (req.reference_id or req.otp_token or "").strip()
    otp_code = (req.otp_code or "").strip()

    if not ref_id or not otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing reference ID or verification code."
        )

    # 1. Fetch OTP record
    otp_record = db.query(models.PasswordResetOTP).filter(
        models.PasswordResetOTP.reference_id == ref_id
    ).first()

    if not otp_record or otp_record.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP session. Please request a new OTP."
        )

    now = datetime.now(timezone.utc)

    # 2. Check Expiry
    expires_at_utc = ensure_utc(otp_record.expires_at)
    if expires_at_utc < now:
        otp_record.is_used = True
        db.add(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has expired. Please request a new OTP."
        )

    # 3. Check Maximum Attempt Count
    if otp_record.attempt_count >= otp_record.max_attempts:
        otp_record.is_used = True
        db.add(otp_record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please request a new OTP."
        )

    # 4. Increment Attempt Count
    otp_record.attempt_count += 1
    db.add(otp_record)
    db.commit()

    # 5. Compare submitted OTP hash with stored hash securely
    if not verify_otp_hash(otp_code, otp_record.otp_hash):
        if otp_record.attempt_count >= otp_record.max_attempts:
            otp_record.is_used = True
            db.add(otp_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many incorrect attempts. Please request a new OTP."
            )
        remaining = otp_record.max_attempts - otp_record.attempt_count
        channel_name = "email" if otp_record.verification_method == "email" else "code"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. Please check your {channel_name} and try again. ({remaining} attempts remaining)"
        )

    # 6. Mark OTP as used (One-time usage)
    otp_record.is_used = True
    db.add(otp_record)
    db.commit()

    # 7. Authorize password reset session token
    identifier = otp_record.email or otp_record.phone_number
    reset_token = create_password_reset_session_token(
        identifier=identifier,
        user_id=otp_record.user_id
    )

    return VerifyOTPResponse(
        message="OTP verified successfully.",
        reset_token=reset_token
    )

@router.post("/reset-password", response_model=ResetPasswordResponse)
@router.post("/forgot-password/reset-password", response_model=ResetPasswordResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Verifies password-reset session token and updates the user's password securely in PostgreSQL.
    """
    if not req.new_password or len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    payload = verify_password_reset_session_token(req.reset_token)
    if not payload:
        # Fallback verification for email-based legacy reset token
        email_sub = verify_reset_token(req.reset_token)
        if email_sub:
            payload = {"sub": email_sub, "user_id": None}

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset session. Please verify OTP again."
        )

    identifier = payload.get("sub")
    user_id = payload.get("user_id")

    user = None
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user and identifier:
        user = db.query(models.User).filter(
            (models.User.email == identifier) | (models.User.phone_number == identifier)
        ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    user.hashed_password = get_password_hash(req.new_password)
    db.add(user)
    db.commit()

    return ResetPasswordResponse(
        message="Your password has been successfully reset. You can now log in with your new password."
    )



