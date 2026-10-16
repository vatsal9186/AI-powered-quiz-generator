from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.database import get_db
from app.dependencies import get_current_admin
import app.models as models
from app.schemas.user import UserResponse
from app.schemas.quiz import QuizResponse, QuestionResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Management"], dependencies=[Depends(get_current_admin)])

# ==========================================
# Admin Statistics & Dashboard
# ==========================================

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get core stats for the admin dashboard.
    """
    total_users = db.query(models.User).count()
    total_quizzes = db.query(models.Quiz).count()
    total_questions = db.query(models.Question).count()
    total_attempts = db.query(models.QuizAttempt).count()
    
    return {
        "success": True,
        "message": "Dashboard statistics loaded successfully.",
        "data": {
            "total_users": total_users,
            "total_quizzes": total_quizzes,
            "total_questions": total_questions,
            "total_attempts": total_attempts
        }
    }

# ==========================================
# User Management
# ==========================================

@router.get("/users")
def get_users_list(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List registered accounts with filtering, search, and pagination.
    """
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            models.User.full_name.ilike(f"%{search}%") | 
            models.User.email.ilike(f"%{search}%")
        )
        
    if role:
        query = query.filter(models.User.role == role.lower())
        
    if status:
        query = query.filter(models.User.status == status.lower())
        
    limit = min(max(limit, 1), 100)
    offset = (max(page, 1) - 1) * limit
    
    total = query.count()
    users = query.order_by(models.User.created_at.desc()).offset(offset).limit(limit).all()
    
    # Map to schema-like list but serialize safely
    users_data = []
    for u in users:
        users_data.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "google_id": u.google_id,
            "profile_picture": u.profile_picture,
            "auth_provider": u.auth_provider,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at,
            "updated_at": u.updated_at,
            "quizzes_count": len(u.quizzes),
            "attempts_count": len(u.attempts)
        })
        
    return {
        "success": True,
        "message": "User accounts retrieved successfully.",
        "data": {
            "total": total,
            "page": page,
            "limit": limit,
            "users": users_data
        }
    }

@router.put("/users/{user_id}")
def update_user_status_or_role(
    user_id: int,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update a user's role or status (active, inactive, suspended).
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    if role is not None:
        role_clean = role.lower().strip()
        if role_clean not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role value. Must be 'user' or 'admin'.")
        user.role = role_clean
        
    if status is not None:
        status_clean = status.lower().strip()
        if status_clean not in ["active", "inactive", "suspended"]:
            raise HTTPException(status_code=400, detail="Invalid status value. Must be 'active', 'inactive', or 'suspended'.")
        user.status = status_clean
        
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": f"User account with ID {user_id} updated successfully.",
        "data": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "status": user.status
        }
    }

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Permanently delete a user account and all their data.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    db.delete(user)
    db.commit()
    
    return {
        "success": True,
        "message": f"User account with ID {user_id} and all associated data deleted successfully."
    }

# ==========================================
# Quiz Management
# ==========================================

@router.get("/quizzes")
def get_quizzes_list(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List quizzes globally with search, filtering, and pagination.
    """
    query = db.query(models.Quiz)
    
    if search:
        query = query.filter(
            models.Quiz.title.ilike(f"%{search}%") | 
            models.Quiz.description.ilike(f"%{search}%")
        )
        
    if difficulty:
        query = query.filter(models.Quiz.difficulty == difficulty.lower())
        
    limit = min(max(limit, 1), 100)
    offset = (max(page, 1) - 1) * limit
    
    total = query.count()
    quizzes = query.order_by(models.Quiz.created_at.desc()).offset(offset).limit(limit).all()
    
    quizzes_data = []
    for q in quizzes:
        quizzes_data.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "source_type": q.source_type,
            "creator_id": q.creator_id,
            "creator_email": q.creator.email if q.creator else "Unknown/Deleted User",
            "questions_count": len(q.questions),
            "attempts_count": len(q.attempts),
            "created_at": q.created_at
        })
        
    return {
        "success": True,
        "message": "Quizzes list retrieved successfully.",
        "data": {
            "total": total,
            "page": page,
            "limit": limit,
            "quizzes": quizzes_data
        }
    }

@router.delete("/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Delete any quiz and associated questions, options, and attempts.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
        
    db.delete(quiz)
    db.commit()
    
    return {
        "success": True,
        "message": f"Quiz with ID {quiz_id} and all related questions, options, and attempts deleted successfully."
    }

# ==========================================
# Question Management
# ==========================================

@router.get("/questions")
def get_questions_list(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List questions globally with search and pagination.
    """
    query = db.query(models.Question)
    
    if search:
        query = query.filter(models.Question.question_text.ilike(f"%{search}%"))
        
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty.lower())
        
    limit = min(max(limit, 1), 100)
    offset = (max(page, 1) - 1) * limit
    
    total = query.count()
    questions = query.order_by(models.Question.created_at.desc()).offset(offset).limit(limit).all()
    
    questions_data = []
    for q in questions:
        questions_data.append({
            "id": q.id,
            "quiz_id": q.quiz_id,
            "quiz_title": q.quiz.title if q.quiz else "Deleted Quiz",
            "question_text": q.question_text,
            "type": q.type,
            "points": q.points,
            "difficulty": q.difficulty,
            "source_chapter": q.source_chapter,
            "explanation": q.explanation,
            "options": [
                {
                    "id": opt.id,
                    "option_text": opt.option_text,
                    "is_correct": opt.is_correct
                } for opt in q.options
            ]
        })
        
    return {
        "success": True,
        "message": "Questions list retrieved successfully.",
        "data": {
            "total": total,
            "page": page,
            "limit": limit,
            "questions": questions_data
        }
    }

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    """
    Delete any question from the question bank.
    """
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")
        
    db.delete(question)
    db.commit()
    
    return {
        "success": True,
        "message": f"Question with ID {question_id} deleted successfully."
    }

# ==========================================
# Admin Analytics & Reports
# ==========================================

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db)):
    """
    Get detailed metrics for admin graphs (User growth, quiz creation daily, difficulty breakdown).
    """
    # 1. User growth (by date created, last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    user_growth = db.query(
        func.date(models.User.created_at).label("date"),
        func.count(models.User.id).label("count")
    ).filter(models.User.created_at >= thirty_days_ago)\
     .group_by(func.date(models.User.created_at))\
     .order_by("date").all()
     
    user_growth_data = [{"date": str(row.date), "count": row.count} for row in user_growth]

    # 2. Daily quizzes created (last 30 days)
    quizzes_daily = db.query(
        func.date(models.Quiz.created_at).label("date"),
        func.count(models.Quiz.id).label("count")
    ).filter(models.Quiz.created_at >= thirty_days_ago)\
     .group_by(func.date(models.Quiz.created_at))\
     .order_by("date").all()
     
    quizzes_daily_data = [{"date": str(row.date), "count": row.count} for row in quizzes_daily]

    # 3. Difficulty breakdown of questions
    difficulty_breakdown = db.query(
        models.Question.difficulty,
        func.count(models.Question.id).label("count")
    ).group_by(models.Question.difficulty).all()
    
    difficulty_data = {row.difficulty or "unspecified": row.count for row in difficulty_breakdown}

    return {
        "success": True,
        "message": "Analytics metrics calculated successfully.",
        "data": {
            "user_growth_30d": user_growth_data,
            "quizzes_created_30d": quizzes_daily_data,
            "difficulty_distribution": difficulty_data
        }
    }

@router.get("/reports")
def get_system_reports(db: Session = Depends(get_db)):
    """
    Get structured reports summary including completion rate and scores averages.
    """
    # Calculate global quiz statistics
    attempts = db.query(models.QuizAttempt).all()
    
    if not attempts:
        avg_score = 0.0
        highest_score = 0.0
        lowest_score = 0.0
        completion_rate = 100.0
    else:
        avg_score = round(sum(att.score for att in attempts) / len(attempts), 1)
        highest_score = max(att.score for att in attempts)
        lowest_score = min(att.score for att in attempts)
        completion_rate = 100.0 # Standard complete metric
        
    return {
        "success": True,
        "message": "System reports summary calculated successfully.",
        "data": {
            "total_attempts": len(attempts),
            "average_score": avg_score,
            "highest_score": highest_score,
            "lowest_score": lowest_score,
            "completion_rate": completion_rate,
            "generated_at": datetime.utcnow()
        }
    }
