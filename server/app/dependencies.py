from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
import app.models as models
from app.schemas.auth import TokenData

# OAuth2PasswordBearer points to the token endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login-swagger", auto_error=False)

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Dependency to secure endpoints. Parses JWT access token from session cookies or headers,
    validates integrity, and returns the currently logged-in user from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Try capturing token from HTTP-only session cookie first,
    # but prioritize header token if it contains a real JWT (starts with 'ey').
    cookie_token = request.cookies.get("questai_session")
    
    token_to_use = None
    if token and token.startswith("ey"):
        token_to_use = token
    else:
        token_to_use = cookie_token or token
        
    if not token_to_use:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token_to_use, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == int(token_data.user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Checks if the authenticated user account status is active.
    """
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or suspended."
        )
    return current_user

def get_current_admin(
    current_user: models.User = Depends(get_current_active_user)
) -> models.User:
    """
    Restricts endpoint access to administrators only.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges to access this resource."
        )
    return current_user
