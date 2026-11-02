# QuestAI - Database Tables for PowerPoint Presentation

Use this reference to copy-paste cleanly into your PowerPoint slides. Each table is formatted with the requested 4 columns:
**`Column` | `Datatype` | `Constraint` | `Description`**

---

### Slide 1: `users` Table
*Stores user accounts, credentials, OAuth mappings, and access roles.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique user account identifier |
| **email** | String(100) | Unique, Not Null | Sign-in email address (optimized to 100) |
| **hashed_password** | String(72) | Nullable | Encrypted password (bcrypt 60-char hash) |
| **full_name** | String(60) | Nullable | User display / real name |
| **google_id** | String(50) | Unique, Nullable | Google OAuth 2.0 unique ID |
| **profile_picture** | String(500) | Nullable | Avatar image URL |
| **auth_provider** | String(20) | Not Null, Default: 'local' | Authentication method ('local', 'google') |
| **role** | String(20) | Not Null, Default: 'user' | Access level ('user', 'admin') |
| **status** | String(20) | Not Null, Default: 'active' | Account status ('active', 'suspended') |
| **phone_number** | String(20) | Unique, Nullable | E.164 international contact number |
| **created_at** | DateTime | Default: Current Time | Account creation timestamp |
| **updated_at** | DateTime | Default: Current Time | Profile last updated timestamp |

---

### Slide 2: `documents` Table
*Stores uploaded lecture materials, textbook PDFs, and processing status.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique document identifier |
| **title** | String(150) | Not Null | User-defined study material title |
| **file_name** | String(150) | Not Null | Original filename (e.g. syllabus.pdf) |
| **content** | Text | Not Null | Full extracted text content from document |
| **owner_id** | Integer | Foreign Key (`users.id`), Not Null | ID of user who uploaded the file |
| **status** | String(20) | Not Null, Default: 'processing'| Parsing state ('processing', 'completed', 'failed') |
| **error_message** | Text | Nullable | Error log if AI parsing fails |
| **created_at** | DateTime | Default: Current Time | Upload timestamp |
| **updated_at** | DateTime | Default: Current Time | Last processing timestamp |

---

### Slide 3: `password_reset_otps` Table
*Manages time-limited one-time passwords for password recovery via SMS/Email.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique OTP record ID |
| **user_id** | Integer | Foreign Key (`users.id`), Nullable | Target user account |
| **verification_method** | String(10) | Not Null, Default: 'sms' | Delivery channel ('sms' or 'email') |
| **phone_number** | String(50) | Nullable | Destination number or fallback email |
| **email** | String(100) | Nullable | Destination email address |
| **reference_id** | String(64) | Unique, Not Null | Public cryptographic reference token |
| **otp_hash** | String(64) | Not Null | SHA-256 hash of the 6-digit code |
| **expires_at** | DateTime | Not Null | Expiration timestamp (5 min window) |
| **attempt_count** | Integer | Default: 0, Not Null | Failed attempts counter (brute-force defense) |
| **max_attempts** | Integer | Default: 5, Not Null | Maximum allowed verification tries |
| **is_used** | Boolean | Default: False, Not Null | Flag preventing OTP replay/reuse |
| **resend_available_at** | DateTime | Nullable | Resend cooldown timestamp |
| **created_at** | DateTime | Default: Current Time | Generation timestamp |

---

### Slide 4: `modules` & `chapters` Tables
*Structural breakdown extracted from uploaded learning materials.*

#### `modules` Table
| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique module ID |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID |
| **title** | String(150) | Not Null | High-level module title |
| **order** | Integer | Default: 0 | Sequential display order |

#### `chapters` Table
| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique chapter ID |
| **document_id** | Integer | Foreign Key (`documents.id`), Not Null | Parent document ID |
| **module_id** | Integer | Foreign Key (`modules.id`), Nullable | Optional parent module ID |
| **title** | String(150) | Not Null | Chapter name |
| **content** | Text | Nullable | Raw chapter body text |
| **order** | Integer | Default: 0 | Display order |

---

### Slide 5: `topics` Table
*Fine-grained subject matters extracted within individual chapters.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique topic ID |
| **chapter_id** | Integer | Foreign Key (`chapters.id`), Not Null | Parent chapter ID |
| **title** | String(150) | Not Null | Sub-topic topic title |
| **order** | Integer | Default: 0 | Display sequence order |

---

### Slide 6: `quizzes` Table
*Quiz configuration, AI parameters, and generation status.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique quiz ID |
| **title** | String(150) | Not Null | Descriptive quiz title |
| **description** | Text | Nullable | Summary of quiz scope |
| **source_type** | String(20) | Not Null | Origin type ('text', 'file', 'url', 'topic') |
| **difficulty** | String(20) | Not Null | Level ('easy', 'medium', 'hard') |
| **creator_id** | Integer | Foreign Key (`users.id`), Nullable | Author user ID |
| **document_id** | Integer | Foreign Key (`documents.id`), Nullable | Source document reference |
| **status** | String(20) | Not Null, Default: 'completed' | Status ('processing', 'completed', 'failed') |
| **error_message** | Text | Nullable | Error log if generation fails |
| **created_at** | DateTime | Default: Current Time | Generation timestamp |
| **updated_at** | DateTime | Default: Current Time | Last update timestamp |

---

### Slide 7: `questions` Table
*AI-generated questions with explanations, chapter tags, and point values.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique question ID |
| **quiz_id** | Integer | Foreign Key (`quizzes.id`), Not Null | Parent quiz ID |
| **question_text** | Text | Not Null | Full question prompt |
| **type** | String(20) | Not Null | Question format ('mcq', 'tf', 'fill', 'short') |
| **explanation** | Text | Nullable | AI pedagogical rationale for correct answer |
| **points** | Integer | Default: 1 | Assigned score points |
| **source_chapter** | String(150) | Nullable | Referenced source chapter |
| **difficulty** | String(20) | Nullable | Question difficulty level |
| **created_at** | DateTime | Default: Current Time | Creation timestamp |

---

### Slide 8: `options` Table
*Multiple-choice choices mapped to each question.*

| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique choice ID |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Parent question ID |
| **option_text** | Text | Not Null | Option choice label / content |
| **is_correct** | Boolean | Not Null, Default: False | True if this is the correct answer |

---

### Slide 9: `quiz_attempts` & `user_answers` Tables
*Student performance scoring, timer logs, and submitted answers.*

#### `quiz_attempts` Table
| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique attempt ID |
| **user_id** | Integer | Foreign Key (`users.id`), Not Null | Student user ID |
| **quiz_id** | Integer | Foreign Key (`quizzes.id`), Not Null | Quiz taken |
| **score** | Float | Not Null | Calculated percentage score (e.g. 88.5) |
| **time_spent** | Integer | Not Null | Duration taken in seconds |
| **completed_at** | DateTime | Default: Current Time | Submission timestamp |

#### `user_answers` Table
| Column | Datatype | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **id** | Integer | Primary Key, Not Null, Auto Inc | Unique answer ID |
| **attempt_id** | Integer | Foreign Key (`quiz_attempts.id`), Not Null | Linked attempt session |
| **question_id** | Integer | Foreign Key (`questions.id`), Not Null | Question answered |
| **selected_option_id** | Integer | Foreign Key (`options.id`), Nullable | Chosen option (null for text inputs) |
| **text_answer** | Text | Nullable | Typed answer for short/fill-in questions |
| **is_correct** | Boolean | Not Null | Evaluation result (True/False) |
