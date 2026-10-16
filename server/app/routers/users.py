from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
import app.models as models
from app.schemas.user import UserResponse, UserUpdate
from app.dependencies import get_current_active_user
from app.utils.security import get_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_active_user)):
    """
    Returns details of the currently authenticated user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated user's profile details (full name or password).
    """
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
        
    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
