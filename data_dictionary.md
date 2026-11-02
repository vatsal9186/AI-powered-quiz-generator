# Data Dictionary - QuestAI (AI Quiz Generator)

This data dictionary documents all **11 database tables** defined in the QuestAI system. Following performance auditing and domain requirement analysis, all text and string columns have been optimized from oversized defaults (e.g., `VARCHAR(255)`) to realistic, constraint-enforced limits.

Each table contains strictly **4 columns**: `Field`, `Type`, `Constraints`, and `Description`.

---

## 1. `users` Table

**Description:** Stores user accounts, authentication credentials (local or Google OAuth), profile details, contact info, and access roles.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for each user account. |
| **email** | String(100) | Unique, Not Null | User's email address (used for sign-in, max 100 chars). |
| **hashed_password** | String(72) | Nullable | Encrypted bcrypt/argon2 hash (60 chars for bcrypt, null for OAuth). |
| **full_name** | String(60) | Nullable | User display/legal full name (optimized for standard naming conventions). |
| **google_id** | String(50) | Unique, Nullable | Google OAuth 2.0 unique 21-digit identifier. |
| **profile_picture** | String(500) | Nullable | Profile avatar image URL (CDN or Google hosted). |
| **auth_provider** | String(20) | Not Null, Default: "local" | Signup provider method ("local", "google"). |
| **role** | String(20) | Not Null, Default: "user" | Access role for authorization ("user", "admin"). |
| **status** | String(20) | Not Null, Default: "active" | Account status ("active", "suspended", "inactive"). |
| **phone_number** | String(20) | Unique, Nullable | E.164 formatted international contact number (+XXXXXXXXXXX). |
| **created_at** | DateTime | Default: Current Time | Account registration timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last profile update timestamp. |

---

## 2. `documents` Table

**Description:** Stores uploaded files, parsed lecture notes, textbooks, and raw text content along with AI processing status.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for each document. |
| **title** | String(150) | Not Null | User-defined title for the uploaded study material. |
| **file_name** | String(150) | Not Null | Original file name (e.g., "computer_networks_ch1.pdf"). |
| **content** | Text | Not Null | Full extracted text content parsed from the uploaded document. |
| **owner_id** | Integer | Foreign Key (`users.id`), Not Null | Account ID of the document uploader. |
| **status** | String(20) | Not Null, Default: "processing" | State of processing ("processing", "completed", "failed"). |
| **error_message** | Text | Nullable | Detailed error log if parsing/text extraction fails. |
| **created_at** | DateTime | Default: Current Time | File upload timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last processing update timestamp. |

---

## 3. `password_reset_otps` Table

**Description:** Manages one-time passwords (OTP) for self-service password reset via SMS or Email.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the OTP transaction. |
| **user_id** | Integer | Foreign Key (`users.id`), Nullable | Target user account being verified. |
| **verification_method** | String(10) | Not Null, Default: "sms" | Delivery channel ("sms" or "email"). |
| **phone_number** | String(50) | Nullable | Target destination (phone number or fallback email identifier). |
| **email** | String(100) | Nullable | Target destination email address. |
| **reference_id** | String(64) | Unique, Not Null | Public cryptographic reference token for client verification. |
| **otp_hash** | String(64) | Not Null | SHA-256 hash of the 6-digit verification code. |
| **expires_at** | DateTime | Not Null | Timestamp when the OTP expires (typically 5 minutes). |
| **attempt_count** | Integer | Default: 0, Not Null | Failed verification attempts counter (prevents brute-force). |
| **max_attempts** | Integer | Default: 5, Not Null | Maximum allowed verification attempts. |
| **is_used** | Boolean | Default: False, Not Null | Flag indicating whether the OTP has already been redeemed. |
| **resend_available_at** | DateTime | Nullable | Cooldown timestamp before another OTP request is allowed. |
| **created_at** | DateTime | Default: Current Time | OTP generation timestamp. |

---

## 4. `modules` Table

**Description:** High-level structural sections extracted from an uploaded document.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the module. |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID. |
| **title** | String(150) | Not Null | Title of the module (e.g., "Module 1: Fundamental Concepts"). |
| **order** | Integer | Default: 0 | Sequential display ordering index. |

---

## 5. `chapters` Table

**Description:** Individual chapters parsed under modules or documents containing source topic text.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the chapter. |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID. |
| **module_id** | Integer | Foreign Key (`modules.id`), Nullable | Optional parent module ID. |
| **title** | String(150) | Not Null | Title of the chapter. |
| **content** | Text | Nullable | Text content contained within this chapter. |
| **order** | Integer | Default: 0 | Sequential display ordering index. |

---

## 6. `topics` Table

**Description:** Fine-grained sub-topics mapped within specific chapters for granular quiz generation.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the topic. |
| **chapter_id** | Integer | Foreign Key (`chapters.id`), Not Null | Parent chapter ID. |
| **title** | String(150) | Not Null | Sub-topic title. |
| **order** | Integer | Default: 0 | Sequential display ordering index. |

---

## 7. `quizzes` Table

**Description:** Stores quiz metadata, difficulty settings, and AI generation parameters.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the quiz. |
| **title** | String(150) | Not Null | Descriptive title of the generated quiz. |
| **description** | Text | Nullable | Detailed summary or curriculum scope of the quiz. |
| **source_type** | String(20) | Not Null | Source material type ("text", "file", "url", "topic"). |
| **difficulty** | String(20) | Not Null | Difficulty rating ("easy", "medium", "hard"). |
| **creator_id** | Integer | Foreign Key (`users.id`), Nullable | ID of the author/creator (null if system generated). |
| **document_id** | Integer | Foreign Key (`documents.id`), Nullable | Associated source document ID. |
| **status** | String(20) | Not Null, Default: "completed" | Generation state ("processing", "completed", "failed"). |
| **error_message** | Text | Nullable | Error log details if AI generation fails. |
| **created_at** | DateTime | Default: Current Time | Quiz creation timestamp. |
| **updated_at** | DateTime | Default: Current Time | Last update timestamp. |

---

## 8. `questions` Table

**Description:** Stores individual questions generated for a quiz along with explanations and points.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the question. |
| **quiz_id** | Integer | Foreign Key (`quizzes.id`), Not Null | Parent quiz ID. |
| **question_text** | Text | Not Null | The question prompt text. |
| **type** | String(20) | Not Null | Question type ("mcq", "tf", "fill", "short"). |
| **explanation** | Text | Nullable | Detailed AI explanation of why the correct option is right. |
| **points** | Integer | Default: 1 | Point score value for answering correctly. |
| **source_chapter** | String(150) | Nullable | Name of the source chapter referenced. |
| **difficulty** | String(20) | Nullable | Question difficulty level ("easy", "medium", "hard"). |
| **created_at** | DateTime | Default: Current Time | Question creation timestamp. |

---

## 9. `options` Table

**Description:** Stores multiple-choice options for questions and identifies the correct option.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the option choice. |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Parent question ID. |
| **option_text** | Text | Not Null | Text of the choice/option. |
| **is_correct** | Boolean | Not Null, Default: False | Flag indicating if this option is the correct answer. |

---

## 10. `quiz_attempts` Table

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

## 11. `user_answers` Table

**Description:** Logs individual user choices and typed responses for each question during an attempt.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Increment | Unique ID for the recorded answer. |
| **attempt_id** | Integer | Foreign Key (`quiz_attempts.id`), Not Null | Associated quiz attempt ID. |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Question being answered. |
| **selected_option_id** | Integer | Foreign Key (`options.id`), Nullable | Selected option ID (null for text answers). |
| **text_answer** | Text | Nullable | Typed answer for fill-in or short-answer questions. |
| **is_correct** | Boolean | Not Null | True if the user's answer is correct. |

---

## Schema Optimization Summary

| Column Category | Old Default | Optimized Type | Data Requirement Rationale |
| :--- | :--- | :--- | :--- |
| **Status / Role / Provider / Type** | `VARCHAR(50)` | `VARCHAR(20)` | Controlled enums (e.g. `'active'`, `'completed'`, `'mcq'`). Longest value is 9 chars. |
| **User Full Name** | `VARCHAR(255)` | `VARCHAR(60)` | Safely accommodates full names without truncation while preventing arbitrary memory bloat. |
| **User Email** | `VARCHAR(255)` | `VARCHAR(100)` | Accommodates 99.9% of realistic emails; protects against buffer overflow while preventing payload attacks. |
| **Password Hashes** | `VARCHAR(255)` | `VARCHAR(72)` | Bcrypt hash output is strictly 60 chars (`$2b$...`). 72 chars safely covers Argon2/Bcrypt headers. |
| **OAuth Identifier** | `VARCHAR(255)` | `VARCHAR(50)` | Google user IDs are 21 digits. |
| **Titles & File Names** | `VARCHAR(255)` | `VARCHAR(150)` | Adequate length for academic titles, chapter headings, and uploaded filenames. |
| **Phone Numbers** | `VARCHAR(50)` | `VARCHAR(20)` (users) / `VARCHAR(50)` (otps) | E.164 phone standard is 15 digits. OTP table allows 50 for identifier fallbacks. |
| **Crypto Tokens / OTP Hashes** | `VARCHAR(255)` | `VARCHAR(64)` | SHA-256 hexadecimal digests are strictly 64 characters. |
| **Profile Picture URL** | `VARCHAR(1000)` | `VARCHAR(500)` | Standard avatar image URLs (Google profile pictures are ~96 chars). |
