from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# ==========================================
# Document & Hierarchy Schemas
# ==========================================

class TopicBase(BaseModel):
    title: str

class TopicResponse(TopicBase):
    id: int
    chapter_id: int

    model_config = ConfigDict(from_attributes=True)


class ChapterBase(BaseModel):
    title: str
    order: int

class ChapterResponse(ChapterBase):
    id: int
    document_id: int
    module_id: Optional[int] = None
    topics: List[TopicResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ModuleBase(BaseModel):
    title: Optional[str] = None
    order: int

class ModuleResponse(ModuleBase):
    id: int
    document_id: int
    chapters: List[ChapterResponse] = []

    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str
    file_name: str

class DocumentResponse(DocumentBase):
    id: int
    owner_id: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    
    # Summary info to help frontend cards
    modules_count: int = 0
    chapters_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentBase):
    id: int
    owner_id: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    structure: List[ModuleResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Quiz & Question Schemas
# ==========================================

class OptionResponse(BaseModel):
    id: int
    option_text: str
    
    # Exclude is_correct unless quiz is being graded/reviewed
    model_config = ConfigDict(from_attributes=True)


class OptionDetailResponse(OptionResponse):
    is_correct: bool


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    type: str
    points: int
    source_chapter: Optional[str] = None
    difficulty: Optional[str] = None
    options: List[OptionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class QuestionDetailResponse(BaseModel):
    id: int
    question_text: str
    type: str
    explanation: Optional[str] = None
    points: int
    source_chapter: Optional[str] = None
    difficulty: Optional[str] = None
    options: List[OptionDetailResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class QuizResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    source_type: str
    difficulty: str
    creator_id: Optional[int] = None
    document_id: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    questions_count: int = 0
    questions: Optional[List[QuestionResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class QuizGenerateRequest(BaseModel):
    document_id: int
    selected_chapters: List[str]  # Names or IDs of chapters
    difficulty: str  # easy, medium, hard
    num_questions: int = Field(10, ge=1, le=30)


# ==========================================
# Quiz Submission & Grading Schemas
# ==========================================

class UserAnswerCreate(BaseModel):
    question_id: int
    selected_option_id: int

class QuizSubmitRequest(BaseModel):
    time_spent: int  # in seconds
    answers: List[UserAnswerCreate]


class UserAnswerDetailResponse(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    is_correct: bool
    correct_option_id: int
    question: QuestionDetailResponse

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    quiz_title: str
    score: float
    time_spent: int
    completed_at: datetime
    answers: List[UserAnswerDetailResponse] = []

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptSummaryResponse(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    score: float
    time_spent: int
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)




# ==========================================
# Instant Answer Check Schemas
# ==========================================

class InstantAnswerCheckRequest(BaseModel):
    question_id: int
    selected_option_id: int

class InstantAnswerCheckResponse(BaseModel):
    question_id: int
    selected_option_id: int
    is_correct: bool
    correct_option_id: Optional[int] = None
    correct_option_text: Optional[str] = None
    explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Manual Quiz Creation & Update Schemas
# ==========================================

class OptionCreate(BaseModel):
    option_text: str
    is_correct: bool

class QuestionCreate(BaseModel):
    question_text: str
    type: str = "mcq"
    explanation: Optional[str] = None
    points: int = 1
    source_chapter: Optional[str] = None
    difficulty: Optional[str] = None
    options: List[OptionCreate]

class QuizCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    source_type: str = "manual"
    difficulty: str
    document_id: Optional[int] = None
    questions: List[QuestionCreate]

class QuizUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
