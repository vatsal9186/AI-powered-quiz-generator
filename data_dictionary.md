# Data Dictionary - QuestAI (AI Quiz Generator)

This data dictionary documents all **10 database tables** defined in the QuestAI system. Each table contains strictly **4 columns**: `Field`, `Type`, `Constraints`, and `Description`.

---

## 1. `users` Table

**Description:** Stores user accounts, authentication credentials (local or Google OAuth), profile details, and access roles.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for each user account. |
| **email** | String(255) | Unique, Not Null | User's email address (used for sign-in). |
| **hashed_password** | String(255) | Nullable | Encrypted password (null for Google OAuth users). |
| **full_name** | String(255) | Nullable | User's display name. |
| **google_id** | String(255) | Unique, Nullable | Google OAuth 2.0 unique identifier. |
| **profile_picture** | String(1000) | Nullable | Profile avatar image URL. |
| **auth_provider** | String(50) | Not Null, Default: "local" | Signup provider method (e.g., "local", "google"). |
| **role** | String(50) | Not Null, Default: "user" | Access role for authorization (e.g., "user", "admin"). |
| **status** | String(50) | Not Null, Default: "active" | Account status (e.g., "active", "suspended"). |
| **created_at** | DateTime | Default: Current Time | Account registration timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last profile update timestamp. |

---

## 2. `documents` Table

**Description:** Stores uploaded files and raw text content along with AI processing status.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for each document. |
| **title** | String(255) | Not Null | User-defined title for the uploaded material. |
| **file_name** | String(255) | Not Null | Original filename (e.g., "computer_networks.pdf"). |
| **content** | Text | Not Null | Extracted text content parsed from the file. |
| **owner_id** | Integer | Foreign Key (`users.id`), Not Null | Account ID of the document uploader. |
| **status** | String(50) | Not Null, Default: "processing" | State of processing (e.g., "processing", "completed", "failed"). |
| **error_message** | Text | Nullable | Error log details if text extraction fails. |
| **created_at** | DateTime | Default: Current Time | File upload timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last processing update timestamp. |

---

## 3. `modules` Table

**Description:** High-level structural sections extracted from a document.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the module. |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID. |
| **title** | String(255) | Not Null | Title of the module (e.g., "Module 1: Fundamental Concepts"). |
| **order** | Integer | Default: 0 | Sequential display order. |

---

## 4. `chapters` Table

**Description:** Individual chapters parsed under modules or documents containing content text.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the chapter. |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID. |
| **module_id** | Integer | Foreign Key (`modules.id`), Nullable | Optional parent module ID. |
| **title** | String(255) | Not Null | Title of the chapter. |
| **content** | Text | Nullable | Text content contained within this chapter. |
| **order** | Integer | Default: 0 | Sequential display order. |

---

## 5. `topics` Table

**Description:** Fine-grained sub-topics mapped within specific chapters.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the topic. |
| **chapter_id** | Integer | Foreign Key (`chapters.id`), Not Null | Parent chapter ID. |
| **title** | String(255) | Not Null | Sub-topic title. |
| **order** | Integer | Default: 0 | Sequential display order. |

---

## 6. `quizzes` Table

**Description:** Stores quiz metadata, difficulty settings, and AI generation parameters.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the quiz. |
| **title** | String(255) | Not Null | Name of the generated quiz. |
| **description** | Text | Nullable | Summary or description of topics covered. |
| **source_type** | String(50) | Not Null | Source material type (e.g., "text", "file", "url"). |
| **difficulty** | String(50) | Not Null | Question difficulty (e.g., "easy", "medium", "hard"). |
| **creator_id** | Integer | Foreign Key (`users.id`), Nullable | ID of the user who created the quiz. |
| **document_id** | Integer | Foreign Key (`documents.id`), Nullable | Associated source document ID. |
| **status** | String(50) | Not Null, Default: "completed" | Generation state (e.g., "completed", "failed"). |
| **error_message** | Text | Nullable | Error log details if AI generation fails. |
| **created_at** | DateTime | Default: Current Time | Creation timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last update timestamp. |

---

## 7. `questions` Table

**Description:** Stores individual questions generated for a quiz along with explanations and points.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the question. |
| **quiz_id** | Integer | Foreign Key (`quizzes.id`), Not Null | Parent quiz ID. |
| **question_text** | Text | Not Null | The question prompt text. |
| **type** | String(50) | Not Null | Question type (e.g., "mcq", "tf", "fill", "short"). |
| **explanation** | Text | Nullable | Detailed AI explanation of the correct answer. |
| **points** | Integer | Default: 1 | Point score value for answering correctly. |
| **source_chapter** | String(255) | Nullable | Name of the source chapter referenced. |
| **difficulty** | String(50) | Nullable | Question difficulty level. |
| **created_at** | DateTime | Default: Current Time | Question creation timestamp. |

---

## 8. `options` Table

**Description:** Stores multiple-choice options for questions and identifies the correct option.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the option choice. |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Parent question ID. |
| **option_text** | Text | Not Null | Text of the choice/option. |
| **is_correct** | Boolean | Not Null, Default: False | Flag indicating if this option is correct. |

---

## 9. `quiz_attempts` Table

**Description:** Records completed quiz attempts, time taken, and total score achieved.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the quiz attempt. |
| **user_id** | Integer | Foreign Key (`users.id`), Not Null | Student/User who attempted the quiz. |
| **quiz_id** | Integer | Foreign Key (`quizzes.id`), Not Null | Quiz that was attempted. |
| **score** | Float | Not Null | Percentage score achieved (e.g., 88.5). |
| **time_spent** | Integer | Not Null | Duration of attempt in seconds. |
| **completed_at** | DateTime | Default: Current Time | Submission timestamp. |

---

## 10. `user_answers` Table

**Description:** Logs individual user choices and typed responses for each question during an attempt.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the recorded answer. |
| **attempt_id** | Integer | Foreign Key (`quiz_attempts.id`), Not Null | Associated quiz attempt ID. |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Question being answered. |
| **selected_option_id** | Integer | Foreign Key (`options.id`), Nullable | Selected option ID (null for text answers). |
| **text_answer** | Text | Nullable | Typed answer for fill-in or short-answer questions. |
| **is_correct** | Boolean | Not Null | True if the user's answer is correct. |
