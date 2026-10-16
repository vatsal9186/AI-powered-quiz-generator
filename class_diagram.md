# QuestAI - UML Class Diagram

This document contains a UML Class Diagram showing the database entity structure and software architecture for **QuestAI**.

These classes map directly to your PostgreSQL database tables, properties, and constraints, representing the system structure for user accounts, document processing, AI quiz generation, and candidate attempts.

---

## QuestAI Classes Overview

1.  **User:** Contains profile details and access roles. Manages actions like registration, login, document uploads, and quiz attempts.
2.  **Document:** Represents files uploaded by users. Extracts content and parses structure.
3.  **Module:** Represents top-level chapters/sections parsed from a document (e.g. Unit 1, Unit 2).
4.  **Chapter:** Stores content text mapped under a module.
5.  **Topic:** Represents specific sub-sections inside a chapter.
6.  **Quiz:** Stores metadata for AI-generated tests, such as difficulty and creation source.
7.  **Question:** Represents individual questions in a quiz (including points and text type).
8.  **Option:** Represents multiple-choice options for a question, noting which option is correct.
9.  **QuizAttempt:** Logs details when a user completes a quiz (e.g. score and time spent).
10. **UserAnswer:** Tracks the specific response chosen by a user for each question in a quiz attempt.

---

## Associations & Multiplicity Rules
*   **User $\rightarrow$ Document:** `1` User uploads `*` Documents.
*   **User $\rightarrow$ Quiz:** `1` User creates `*` Quizzes.
*   **User $\rightarrow$ QuizAttempt:** `1` User takes `*` QuizAttempts.
*   **Document $\rightarrow$ Module:** `1` Document contains `*` Modules.
*   **Document $\rightarrow$ Chapter:** `1` Document contains `*` Chapters.
*   **Module $\rightarrow$ Chapter:** `1` Module structures `*` Chapters.
*   **Chapter $\rightarrow$ Topic:** `1` Chapter contains `*` Topics.
*   **Document $\rightarrow$ Quiz:** `0..1` Document generates `*` Quizzes.
*   **Quiz $\rightarrow$ Question:** `1` Quiz contains `*` Questions.
*   **Quiz $\rightarrow$ QuizAttempt:** `1` Quiz is attempted by `*` QuizAttempts.
*   **Question $\rightarrow$ Option:** `1` Question has `2..*` Options.
*   **QuizAttempt $\rightarrow$ UserAnswer:** `1` QuizAttempt contains `*` UserAnswers.
*   **Question $\rightarrow$ UserAnswer:** `1` Question is answered by `*` UserAnswers.

---

- **[View Class Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_class_diagram.svg)**

![Class Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_class_diagram.svg)
