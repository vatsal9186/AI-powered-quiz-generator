import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_active_user
import app.models as models
from app.schemas.quiz import DocumentResponse, DocumentDetailResponse
from app.utils.file_validator import validate_uploaded_file, FileValidationError
from app.utils.document_parser import extract_text_for_validated_file, clean_postgres_text
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
        document.content = clean_postgres_text(content)
        if structure_data.get("document_title"):
            document.title = clean_postgres_text(structure_data.get("document_title"))

        for mod_idx, mod in enumerate(structure_data.get("structure", [])):
            mod_title = clean_postgres_text(mod.get("module_title") or "Course Curriculum Outline")
            db_module = models.Module(
                document_id=document.id,
                title=mod_title,
                order=mod_idx
            )
            db.add(db_module)
            db.commit()
            db.refresh(db_module)

            for chap_idx, chap in enumerate(mod.get("chapters", [])):
                chap_title = clean_postgres_text(chap.get("chapter_title") or f"Chapter {chap_idx+1}")
                chap_content = clean_postgres_text(chap.get("content", ""))
                db_chapter = models.Chapter(
                    document_id=document.id,
                    module_id=db_module.id,
                    title=chap_title,
                    content=chap_content,
                    order=chap_idx
                )
                db.add(db_chapter)
                db.commit()
                db.refresh(db_chapter)

                for top_idx, topic_title in enumerate(chap.get("topics", [])):
                    db_topic = models.Topic(
                        chapter_id=db_chapter.id,
                        title=clean_postgres_text(topic_title),
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

            if len(concatenated_content.strip()) >= 50:
                from app.utils.gemini_helper import generate_quiz_questions

                # Generate 15 medium-difficulty MCQ questions from the full document
                quiz_questions = generate_quiz_questions(concatenated_content, "medium", 15)

                # Create quiz record
                auto_quiz = models.Quiz(
                    title=clean_postgres_text(f"{document.title} - Auto Generated Quiz"),
                    description=clean_postgres_text(f"Automatically generated quiz from all chapters of {document.file_name}."),
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
                        question_text=clean_postgres_text(q_data["question"]),
                        type="mcq",
                        explanation=clean_postgres_text(q_data.get("explanation", "")),
                        points=1,
                        source_chapter=clean_postgres_text(q_data.get("source_chapter") or (all_chapters[0].title if all_chapters else None)),
                        difficulty=q_data.get("difficulty", "medium").lower()
                    )
                    db.add(db_question)
                    db.commit()
                    db.refresh(db_question)

                    for opt_text in q_data["options"]:
                        is_correct = (opt_text == q_data["correct_answer"])
                        db_option = models.Option(
                            question_id=db_question.id,
                            option_text=clean_postgres_text(opt_text),
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
        # Fallback error mapping with sanitized error string
        document = db.query(models.Document).filter(models.Document.id == document_id).first()
        if document:
            document.status = "failed"
            document.error_message = clean_postgres_text(f"Document processing failed: {str(e)}")
            db.commit()
        try:
            print(f"Background document processing crashed: {ascii(str(e))[:200]}")
        except Exception:
            pass
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

    # 2. Check if this document has already been processed successfully
    existing_ready = db.query(models.Document).filter(
        models.Document.owner_id == current_user.id,
        models.Document.file_name == filename,
        models.Document.status == "ready"
    ).order_by(models.Document.id.desc()).first()

    if existing_ready and existing_ready.chapters:
        print(f"Document '{filename}' is already processed and ready (ID {existing_ready.id}), reusing existing structure.")
        return existing_ready

    # Clean up any stale failed attempts for this document
    failed_docs = db.query(models.Document).filter(
        models.Document.owner_id == current_user.id,
        models.Document.file_name == filename,
        models.Document.status == "failed"
    ).all()
    for fd in failed_docs:
        db.delete(fd)
    db.commit()

    # Self-heal stuck processing requests (> 2 minutes)
    from datetime import datetime, timezone, timedelta

    existing_processing = db.query(models.Document).filter(
        models.Document.owner_id == current_user.id,
        models.Document.file_name == filename,
        models.Document.status.in_(["processing", "extracting", "detecting", "generating_quiz"])
    ).all()

    active_exists = False
    for doc in existing_processing:
        now = datetime.utcnow()
        doc_created = doc.created_at
        if doc_created.tzinfo is not None:
            doc_created = doc_created.astimezone(timezone.utc).replace(tzinfo=None)
            
        if now - doc_created > timedelta(minutes=2):
            db.delete(doc)
            db.commit()
        else:
            active_exists = True

    if active_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document is currently being processed. Please wait a moment."
        )

    # 3. Create Document entry with status 'processing'
    doc_title = clean_postgres_text(filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").strip().title())
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
