import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_active_user
import app.models as models
from app.schemas.quiz import DocumentResponse, DocumentDetailResponse
from app.utils.file_validator import validate_uploaded_file, FileValidationError
from app.utils.document_parser import extract_text_for_validated_file
from app.utils.gemini_helper import analyze_document

router = APIRouter(prefix="/api/documents", tags=["Documents"])

def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filenames to keep only alphanumeric, dots, hyphens, underscores, and spaces.
    """
    name = re.sub(r'[^a-zA-Z0-9._\- ]', '', filename)
    name = re.sub(r'\s+', ' ', name).strip()
    return name or "unnamed_document"

def process_document_in_background(document_id: int, file_bytes: bytes, filename: str, detected_format: str):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Fetch document
        document = db.query(models.Document).filter(models.Document.id == document_id).first()
        if not document:
            return

        # 1. Extract content phase
        document.status = "extracting"
        db.commit()

        try:
            content = extract_text_for_validated_file(file_bytes, detected_format)
        except Exception:
            document.status = "failed"
            document.error_message = "Document processing failed. Text extraction failed."
            db.commit()
            return

        if not content.strip():
            document.status = "failed"
            document.error_message = "The uploaded document contains no readable text content."
            db.commit()
            return

        # 2. Detect chapters phase
        document.status = "detecting"
        db.commit()

        try:
            structure_data = analyze_document(content, filename)
        except Exception as e:
            document.status = "failed"
            document.error_message = f"Chapter detection failed: {str(e)}"
            db.commit()
            return

        # 3. Store processed content phase
        document.content = content
        if structure_data.get("document_title"):
            document.title = structure_data.get("document_title")

        for mod_idx, mod in enumerate(structure_data.get("structure", [])):
            db_module = models.Module(
                document_id=document.id,
                title=mod.get("module_title") or "Course Curriculum Outline",
                order=mod_idx
            )
            db.add(db_module)
            db.commit()
            db.refresh(db_module)

            for chap_idx, chap in enumerate(mod.get("chapters", [])):
                db_chapter = models.Chapter(
                    document_id=document.id,
                    module_id=db_module.id,
                    title=chap.get("chapter_title"),
                    content=chap.get("content", ""),
                    order=chap_idx
                )
                db.add(db_chapter)
                db.commit()
                db.refresh(db_chapter)

                for top_idx, topic_title in enumerate(chap.get("topics", [])):
                    db_topic = models.Topic(
                        chapter_id=db_chapter.id,
                        title=topic_title,
                        order=top_idx
                    )
                    db.add(db_topic)
                db.commit()

        document.status = "ready"
        db.commit()
        print(f"Background document processing succeeded for document ID {document_id}")

        # ==========================================
        # Auto-generate MCQ quiz from all chapters
        # ==========================================
        try:
            all_chapters = db.query(models.Chapter).filter(
                models.Chapter.document_id == document.id
            ).all()

            concatenated_content = "\n\n".join([c.content for c in all_chapters if c.content])

            if len(concatenated_content.strip()) >= 100:
                from app.utils.gemini_helper import generate_quiz_questions

                # Generate 15 medium-difficulty MCQ questions from the full document
                quiz_questions = generate_quiz_questions(concatenated_content, "medium", 15)

                # Create quiz record
                auto_quiz = models.Quiz(
                    title=f"{document.title} - Auto Generated Quiz",
                    description=f"Automatically generated quiz from all chapters of {document.file_name}.",
                    source_type="file",
                    difficulty="medium",
                    creator_id=document.owner_id,
                    document_id=document.id,
                    status="completed"
                )
                db.add(auto_quiz)
                db.commit()
                db.refresh(auto_quiz)

                # Save questions and options
                for q_data in quiz_questions:
                    db_question = models.Question(
                        quiz_id=auto_quiz.id,
                        question_text=q_data["question"],
                        type="mcq",
                        explanation=q_data["explanation"],
                        points=1,
                        source_chapter=q_data.get("source_chapter") or (all_chapters[0].title if all_chapters else None),
                        difficulty=q_data.get("difficulty", "medium").lower()
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

                print(f"Auto-quiz generated successfully for document ID {document_id} (Quiz ID {auto_quiz.id})")
            else:
                print(f"Document {document_id} content too short for auto-quiz generation, skipping.")

        except Exception as quiz_err:
            # Auto-quiz generation failed - not a critical error, document is still usable
            print(f"Auto-quiz generation failed for document {document_id}: {quiz_err}")

    except Exception as e:
        db.rollback()
        # Fallback error mapping
        document = db.query(models.Document).filter(models.Document.id == document_id).first()
        if document:
            document.status = "failed"
            document.error_message = f"Document processing failed: {str(e)}"
            db.commit()
        print(f"Background document processing crashed: {e}")
    finally:
        db.close()

@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Upload a document, validate it immediately, save record with 'processing' status,
    and process text extraction / chapter layout in the background.
    """
    file_bytes = await file.read()
    filename = sanitize_filename(file.filename or "document.pdf")
    
    # 1. File validation check (runs immediately)
    detected_format = validate_uploaded_file(file_bytes, filename)

    # 2. Prevent duplicate processing requests with self-healing for stuck processes
    from datetime import datetime, timezone, timedelta

    existing_processing = db.query(models.Document).filter(
        models.Document.owner_id == current_user.id,
        models.Document.file_name == filename,
        models.Document.status.in_(["processing", "extracting", "detecting", "generating_quiz"])
    ).all()

    active_exists = False
    for doc in existing_processing:
        # Check if the process is stuck (older than 10 minutes)
        now = datetime.utcnow()
        doc_created = doc.created_at
        if doc_created.tzinfo is not None:
            # Convert to naive UTC for safe comparison
            doc_created = doc_created.astimezone(timezone.utc).replace(tzinfo=None)
            
        if now - doc_created > timedelta(minutes=10):
            # Self-heal: mark stuck document as failed
            doc.status = "failed"
            doc.error_message = "Document processing timed out or got stuck. Please try uploading again."
            db.commit()
        else:
            active_exists = True

    if active_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document is already being processed. Please wait for it to complete."
        )

    # 3. Create Document entry with status 'processing'
    doc_title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip().title()
    db_document = models.Document(
        title=doc_title,
        file_name=filename,
        content="", # Empty until extracted
        owner_id=current_user.id,
        status="processing"
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # 4. Offload heavy parsing & chapter detection tasks to background tasks
    background_tasks.add_task(
        process_document_in_background,
        db_document.id,
        file_bytes,
        filename,
        detected_format
    )

    return db_document

from typing import List, Optional

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get all uploaded documents belonging to the authenticated user.
    """
    query = db.query(models.Document).filter(models.Document.owner_id == current_user.id)
    
    if search:
        query = query.filter(models.Document.title.ilike(f"%{search}%"))
        
    # Apply pagination
    limit = min(max(limit, 1), 100)
    offset = (max(page, 1) - 1) * limit
    
    documents = query.order_by(models.Document.created_at.desc()).offset(offset).limit(limit).all()
    
    # Calculate modules and chapters counts dynamically for summary schema
    for doc in documents:
        doc.modules_count = len(doc.modules)
        doc.chapters_count = len(doc.chapters)
        
    return documents

@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get the detailed layout structure of a specific document.
    """
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if document.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this document.")
        
    return document

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a document and all associated modules, chapters, and topics.
    """
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    if document.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this document.")
        
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully."}
