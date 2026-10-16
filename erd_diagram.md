# QuestAI - Entity Relationship Diagram (ERD)

This document provides visual and interactive representations of the complete **10-table database schema** for the QuestAI quiz generator project on a clean **White Background**.

## 1. Interactive 10-Table White-Theme Mermaid Diagram

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryBorderColor': '#2563eb', 'primaryTextColor': '#0f172a', 'lineColor': '#2563eb', 'tertiaryColor': '#f8fafc' }}}%%
erDiagram
    users {
        int id PK
        string email UQ
        string hashed_password
        string full_name
        string google_id UQ
        string profile_picture
        string auth_provider
        string role
        string status
        datetime created_at
        datetime updated_at
    }

    documents {
        int id PK
        int owner_id FK
        string title
        string file_name
        string content
        string status
        string error_message
        datetime created_at
        datetime updated_at
    }

    modules {
        int id PK
        int document_id FK
        string title
        int order
    }

    chapters {
        int id PK
        int document_id FK
        int module_id FK
        string title
        string content
        int order
    }

    topics {
        int id PK
        int chapter_id FK
        string title
        int order
    }

    quizzes {
        int id PK
        int creator_id FK
        int document_id FK
        string title
        string description
        string source_type
        string difficulty
        string status
        datetime created_at
    }

    questions {
        int id PK
        int quiz_id FK
        string question_text
        string type
        string explanation
        int points
        string difficulty
        datetime created_at
    }

    options {
        int id PK
        int question_id FK
        string option_text
        boolean is_correct
    }

    quiz_attempts {
        int id PK
        int user_id FK
        int quiz_id FK
        float score
        int time_spent
        datetime completed_at
    }

    user_answers {
        int id PK
        int attempt_id FK
        int question_id FK
        int selected_option_id FK
        string text_answer
        boolean is_correct
    }

    users ||--o{ documents : "uploaded_by (1:N)"
    users ||--o{ quizzes : "generated_by (1:N)"
    users ||--o{ quiz_attempts : "taken_by (1:N)"
    documents ||--o{ quizzes : "source_material (1:N)"
    documents ||--o{ modules : "has_modules (1:N)"
    documents ||--o{ chapters : "has_chapters (1:N)"
    modules ||--o{ chapters : "groups (1:N)"
    chapters ||--o{ topics : "contains_topics (1:N)"
    quizzes ||--o{ questions : "contains (1:N)"
    quizzes ||--o{ quiz_attempts : "records (1:N)"
    questions ||--o{ options : "has (1:N)"
    quiz_attempts ||--o{ user_answers : "records (1:N)"
    questions ||--o{ user_answers : "answers_for (1:N)"
    options ||--|| user_answers : "chosen_option (1:1)"
```

---

## 2. White-Background Vector ERD Diagram

The SVG vector diagram renders all **10 entity tables** on a **pure white canvas (`#ffffff`)**:

- **[View Pure White Background ERD Vector Diagram (SVG)](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/erd_diagram.svg)**

![QuestAI ERD White Theme](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/erd_diagram.svg)



