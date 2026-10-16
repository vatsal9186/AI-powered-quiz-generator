from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_active_user
import app.models as models
from app.schemas.quiz import (
    QuizResponse, QuizGenerateRequest, QuizSubmitRequest, QuizAttemptResponse,
    QuizAttemptSummaryResponse, QuizCreateRequest, QuizUpdateRequest,
    InstantAnswerCheckRequest
)
from app.utils.gemini_helper import generate_quiz_questions, generate_aptitude_questions

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


# ==========================================
# Instant Answer Check Endpoint
# ==========================================

@router.post("/check-answer")
def check_answer_instant(
    payload: InstantAnswerCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Instantly check a single answer and return feedback with correct answer + explanation.
    Used for real-time practice mode where users see results immediately.
    """
    question = db.query(models.Question).filter(
        models.Question.id == payload.question_id
    ).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Verify quiz ownership
    if question.quiz.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this quiz question.")

    selected_option = db.query(models.Option).filter(
        models.Option.id == payload.selected_option_id,
        models.Option.question_id == question.id
    ).first()

    if not selected_option:
        raise HTTPException(status_code=400, detail="Selected option does not belong to this question.")

    correct_option = db.query(models.Option).filter(
        models.Option.question_id == question.id,
        models.Option.is_correct == True
    ).first()

    is_correct = selected_option.is_correct

    return {
        "question_id": question.id,
        "selected_option_id": payload.selected_option_id,
        "is_correct": is_correct,
        "correct_option_id": correct_option.id if correct_option else None,
        "correct_option_text": correct_option.option_text if correct_option else None,
        "explanation": question.explanation
    }


@router.get("/aptitude")
def get_aptitude_test(
    difficulty: str = "medium",
    num_questions: int = 10,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Generate dynamic aptitude questions using the secondary Gemini API key.
    """
    try:
        questions = generate_aptitude_questions(difficulty=difficulty, num_questions=num_questions)
        return {"success": True, "questions": questions}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate aptitude questions: {str(e)}"
        )



def generate_quiz_in_background(
    quiz_id: int,
    document_id: int,
    selected_chapters_titles: List[str],
    difficulty: str,
    num_questions: int
):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Retrieve quiz
        quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
        if not quiz:
            return
            
        # Retrieve selected chapters' contents
        selected_chapters = db.query(models.Chapter).filter(
            models.Chapter.document_id == document_id,
            models.Chapter.title.in_(selected_chapters_titles)
        ).all()

        if not selected_chapters:
            # Check for "Entire Document" fallback
            if "Entire Document" in selected_chapters_titles or not selected_chapters_titles:
                selected_chapters = db.query(models.Chapter).filter(models.Chapter.document_id == document_id).all()

        if not selected_chapters:
            quiz.status = "failed"
            quiz.error_message = "No valid chapters found to generate quiz from."
            db.commit()
            return

        # Concatenate contents
        concatenated_content = "\n\n".join([chap.content for chap in selected_chapters if chap.content])
        
        if len(concatenated_content.strip()) < 100:
            quiz.status = "failed"
            quiz.error_message = "The selected chapter content is too short to generate a quiz (minimum 100 characters)."
            db.commit()
            return

        # Generate questions using Gemini helper
        try:
            gemini_questions = generate_quiz_questions(
                concatenated_content,
                difficulty,
                num_questions
            )
        except Exception as e:
            quiz.status = "failed"
            quiz.error_message = f"Failed to generate questions with AI: {str(e)}"
            db.commit()
            return

        # Save questions and options
        for q_data in gemini_questions:
            db_question = models.Question(
                quiz_id=quiz.id,
                question_text=q_data["question"],
                type="mcq",
                explanation=q_data["explanation"],
                points=1,
                source_chapter=q_data.get("source_chapter") or selected_chapters[0].title,
                difficulty=difficulty.lower()
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)

            for opt_text in q_data["options"]:
                is_correct = (opt_text == q_data["correct_answer"])
                db_option = models.Option(
                    question_id=db_question.id,
                    option_text=opt_text,
                    is_correct=is_correct
                )
                db.add(db_option)
            db.commit()

        quiz.status = "completed"
        db.commit()
        print(f"Quiz {quiz_id} generated successfully in background.")
        
    except Exception as e:
        db.rollback()
        quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
        if quiz:
            quiz.status = "failed"
            quiz.error_message = f"Failed to save generated quiz questions to DB: {str(e)}"
            db.commit()
        print(f"Quiz generation background task crashed: {e}")
    finally:
        db.close()

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    payload: QuizGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Initiate asynchronous quiz generation using Gemini from selected document chapters.
    """
    # 1. Fetch document and check ownership / readiness
    document = db.query(models.Document).filter(models.Document.id == payload.document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source document not found.")
        
    if document.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this document.")

    if document.status != "ready":
        if document.status == "failed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot generate quiz: source document processing failed ({document.error_message})."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The source document is still being processed. Please wait until it is ready."
            )

    # 2. Prevent duplicate quiz-generation requests
    existing_generating = db.query(models.Quiz).filter(
        models.Quiz.creator_id == current_user.id,
        models.Quiz.document_id == document.id,
        models.Quiz.status == "generating"
    ).first()
    if existing_generating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A quiz is already being generated for this document. Please wait for it to complete."
        )

    # 3. Save initial Quiz state as 'generating'
    quiz_title = f"{document.title} - {', '.join(payload.selected_chapters[:2])}"
    if len(payload.selected_chapters) > 2:
        quiz_title += " & others"
        
    db_quiz = models.Quiz(
        title=quiz_title,
        description=f"Generated AI quiz based on selected chapters of {document.file_name}.",
        source_type="file",
        difficulty=payload.difficulty.lower(),
        creator_id=current_user.id,
        document_id=document.id,
        status="generating"
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    # 4. Offload heavy generation task to background tasks
    background_tasks.add_task(
        generate_quiz_in_background,
        db_quiz.id,
        document.id,
        payload.selected_chapters,
        payload.difficulty,
        payload.num_questions
    )

    return db_quiz

@router.get("", response_model=List[QuizResponse])
def list_quizzes(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get all generated quizzes belonging to the authenticated user.
    """
    query = db.query(models.Quiz).filter(models.Quiz.creator_id == current_user.id)
    
    if search:
        query = query.filter(
            models.Quiz.title.ilike(f"%{search}%") | 
            models.Quiz.description.ilike(f"%{search}%")
        )
        
    if difficulty:
        query = query.filter(models.Quiz.difficulty == difficulty.lower())
        
    # Apply pagination
    limit = min(max(limit, 1), 100)
    offset = (max(page, 1) - 1) * limit
    
    quizzes = query.order_by(models.Quiz.created_at.desc()).offset(offset).limit(limit).all()
    for q in quizzes:
        q.questions_count = len(q.questions)
    return quizzes

@router.get("/{quiz_id}")
def get_quiz(
    quiz_id: int,
    mode: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get questions and options for a specific quiz.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
        
    if quiz.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this quiz.")
        
    if mode == "practice":
        questions_list = []
        for q in quiz.questions:
            questions_list.append({
                "id": q.id,
                "quiz_id": q.quiz_id,
                "question_text": q.question_text,
                "type": q.type,
                "explanation": q.explanation,
                "points": q.points,
                "source_chapter": q.source_chapter,
                "difficulty": q.difficulty,
                "options": [
                    {
                        "id": opt.id,
                        "option_text": opt.option_text,
                        "is_correct": opt.is_correct
                    }
                    for opt in q.options
                ]
            })
        return {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "source_type": quiz.source_type,
            "difficulty": quiz.difficulty,
            "creator_id": quiz.creator_id,
            "document_id": quiz.document_id,
            "created_at": quiz.created_at,
            "questions_count": len(quiz.questions),
            "questions": questions_list,
            "status": quiz.status,
            "error_message": quiz.error_message
        }
        
    # Standard format returning basic OptionResponse (no is_correct)
    return QuizResponse.model_validate(quiz)

@router.delete("/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a generated quiz and its questions.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
        
    if quiz.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this quiz.")
        
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully."}

@router.post("/{quiz_id}/submit", response_model=QuizAttemptResponse)
def submit_quiz(
    quiz_id: int,
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Grade a quiz attempt, log the score, and return correct answer feedback.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
        
    if quiz.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this quiz.")

    total_questions = len(quiz.questions)
    if total_questions == 0:
        raise HTTPException(status_code=400, detail="This quiz has no questions.")

    correct_count = 0
    user_answers_db = []

    # Iterate and grade each question
    for answer_in in payload.answers:
        question = db.query(models.Question).filter(
            models.Question.id == answer_in.question_id,
            models.Question.quiz_id == quiz_id
        ).first()
        
        if not question:
            continue
            
        selected_option = db.query(models.Option).filter(
            models.Option.id == answer_in.selected_option_id,
            models.Option.question_id == question.id
        ).first()
        
        is_correct = False
        if selected_option and selected_option.is_correct:
            is_correct = True
            correct_count += 1
            
        db_user_answer = models.UserAnswer(
            question_id=question.id,
            selected_option_id=answer_in.selected_option_id,
            is_correct=is_correct
        )
        user_answers_db.append(db_user_answer)

    percentage_score = round((correct_count / total_questions) * 100, 1)

    # Save the Attempt
    db_attempt = models.QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=percentage_score,
        time_spent=payload.time_spent
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)

    # Associate attempt ID with answers and commit them
    for ua in user_answers_db:
        ua.attempt_id = db_attempt.id
        db.add(ua)
    db.commit()

    # Re-fetch attempt with relations loaded for detailed schema mapping
    # We will build response answers list manually to map the correct/selected choices accurately
    response_answers = []
    for ua in user_answers_db:
        # Find correct option ID
        correct_option = db.query(models.Option).filter(
            models.Option.question_id == ua.question_id,
            models.Option.is_correct == True
        ).first()
        
        # Load question detailed model
        question_obj = db.query(models.Question).filter(models.Question.id == ua.question_id).first()
        
        response_answers.append({
            "question_id": ua.question_id,
            "selected_option_id": ua.selected_option_id,
            "is_correct": ua.is_correct,
            "correct_option_id": correct_option.id if correct_option else 0,
            "question": question_obj
        })

    return {
        "id": db_attempt.id,
        "user_id": db_attempt.user_id,
        "quiz_id": db_attempt.quiz_id,
        "quiz_title": quiz.title,
        "score": db_attempt.score,
        "time_spent": db_attempt.time_spent,
        "completed_at": db_attempt.completed_at,
        "answers": response_answers
    }

@router.get("/attempts/history", response_model=List[QuizAttemptSummaryResponse])
def get_attempts_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    List all historical attempts of generated quizzes for the user.
    """
    attempts = db.query(models.QuizAttempt).join(models.Quiz).filter(
        models.QuizAttempt.user_id == current_user.id
    ).order_by(models.QuizAttempt.completed_at.desc()).all()
    
    # Pre-populate titles manually to pass response schema validation
    for attempt in attempts:
        attempt.quiz_title = attempt.quiz.title
        
    return attempts




# ==========================================
# Manual Quiz & Attempt Management Endpoints
# ==========================================

@router.post("/create", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(
    payload: QuizCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Manually create a new quiz with custom questions and options.
    """
    # Verify document if provided
    if payload.document_id:
        doc = db.query(models.Document).filter(models.Document.id == payload.document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Associated document not found.")
        if doc.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not have access to this document.")
            
    db_quiz = models.Quiz(
        title=payload.title,
        description=payload.description,
        source_type=payload.source_type,
        difficulty=payload.difficulty.lower(),
        creator_id=current_user.id,
        document_id=payload.document_id
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    try:
        for q_data in payload.questions:
            db_question = models.Question(
                quiz_id=db_quiz.id,
                question_text=q_data.question_text,
                type=q_data.type,
                explanation=q_data.explanation,
                points=q_data.points,
                source_chapter=q_data.source_chapter,
                difficulty=q_data.difficulty.lower() if q_data.difficulty else payload.difficulty.lower()
            )
            db.add(db_question)
            db.commit()
            db.refresh(db_question)
            
            for opt_data in q_data.options:
                db_option = models.Option(
                    question_id=db_question.id,
                    option_text=opt_data.option_text,
                    is_correct=opt_data.is_correct
                )
                db.add(db_option)
            db.commit()
    except Exception as e:
        db.delete(db_quiz)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create manual quiz questions: {str(e)}"
        )
        
    full_quiz = db.query(models.Quiz).filter(models.Quiz.id == db_quiz.id).first()
    full_quiz.questions_count = len(full_quiz.questions)
    return full_quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(
    quiz_id: int,
    payload: QuizUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update a quiz's title, description, or difficulty.
    """
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    if quiz.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this quiz.")
        
    if payload.title is not None:
        quiz.title = payload.title
    if payload.description is not None:
        quiz.description = payload.description
    if payload.difficulty is not None:
        quiz.difficulty = payload.difficulty.lower()
        
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    quiz.questions_count = len(quiz.questions)
    return quiz

@router.get("/attempts/{attempt_id}", response_model=QuizAttemptResponse)
def get_attempt_details(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Retrieve details of a specific quiz attempt with grading details.
    """
    attempt = db.query(models.QuizAttempt).filter(models.QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Quiz attempt not found.")
    if attempt.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have access to this quiz attempt.")
        
    response_answers = []
    for ua in attempt.answers:
        correct_option = db.query(models.Option).filter(
            models.Option.question_id == ua.question_id,
            models.Option.is_correct == True
        ).first()
        
        response_answers.append({
            "question_id": ua.question_id,
            "selected_option_id": ua.selected_option_id,
            "is_correct": ua.is_correct,
            "correct_option_id": correct_option.id if correct_option else 0,
            "question": ua.question
        })
        
    return {
        "id": attempt.id,
        "user_id": attempt.user_id,
        "quiz_id": attempt.quiz_id,
        "quiz_title": attempt.quiz.title,
        "score": attempt.score,
        "time_spent": attempt.time_spent,
        "completed_at": attempt.completed_at,
        "answers": response_answers
    }
