# QuestAI - Actor Use-Case Diagrams

This document contains detailed Use Case Diagrams for each of the 4 primary actors of the QuestAI system.

---

## 1. Admin Use-case Diagram
The Admin manages users, moderates generated quizzes/documents, views platform-wide metrics, and manages system configurations.

```mermaid
graph LR
    Admin["🛠️ System Admin"]
    
    subgraph Admin_Use_Cases ["Admin Capabilities"]
        A1(["Admin Sign In (/admin/login)"])
        A2(["Admin Registration (/admin/register)"])
        A3(["View Dashboard Analytics & Growth Charts"])
        A4(["Manage Users (Update Role, Status, Delete)"])
        A5(["Moderate Documents & Extracted Content"])
        A6(["Moderate Quizzes & Questions"])
    end

    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
    Admin --> A6
```

- **[View Admin Use-case SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_usecase.svg)**

![QuestAI Admin Use Case](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_usecase.svg)

---

## 2. Quiz Creator Use-case Diagram
The Quiz Creator (Registered User) uploads documents or source text and configures AI parameters to generate and edit quizzes.

```mermaid
graph LR
    Creator["👨‍💻 Quiz Creator (Registered User)"]
    
    subgraph Creator_Use_Cases ["Quiz Creation Capabilities"]
        C1(["Sign Up / Login (Local or Google OAuth)"])
        C2(["Upload Source File (PDF / Text Document)"])
        C3(["Inspect Document Structure (Modules & Chapters)"])
        C4(["Configure Quiz (Difficulty, Type, Count)"])
        C5(["Generate Quiz via AI"])
        C6(["Edit Questions & Options"])
        C7(["Delete / Manage Created Quizzes"])
    end

    Creator --> C1
    Creator --> C2
    Creator --> C3
    Creator --> C4
    Creator --> C5
    Creator --> C6
    Creator --> C7
```

- **[View Quiz Creator Use-case SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_creator_usecase.svg)**

![QuestAI Quiz Creator Use Case](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_creator_usecase.svg)

---

## 3. Quiz Taker Use-case Diagram
The Quiz Taker (Student / Candidate) browses quizzes, completes timed quiz attempts, and reviews answer explanations.

```mermaid
graph LR
    Taker["🎓 Quiz Taker (Student)"]
    
    subgraph Taker_Use_Cases ["Quiz Taking Capabilities"]
        T1(["Browse Available Quizzes"])
        T2(["Start Timed Quiz Attempt"])
        T3(["Submit Answers (MCQ / Text / True-False)"])
        T4(["View Real-time Timer & Progress"])
        T5(["Receive Instant Score & Performance Analysis"])
        T6(["Review Answer Explanations & Correct Options"])
    end

    Taker --> T1
    Taker --> T2
    Taker --> T3
    Taker --> T4
    Taker --> T5
    Taker --> T6
```

- **[View Quiz Taker Use-case SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_taker_usecase.svg)**

![QuestAI Quiz Taker Use Case](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_taker_usecase.svg)

---

## 4. AI Engine Use-case Diagram
The AI Engine is the automated system actor (Gemini API / FAST_UPLOAD_MODE) that handles layout extraction, question generation, and grading explanations.

```mermaid
graph LR
    AI["🤖 Gemini AI Engine (System Actor)"]
    
    subgraph AI_Use_Cases ["AI Worker Operations"]
        E1(["Extract Raw Text from Uploaded Files"])
        E2(["Parse Structure (Modules, Chapters, Topics)"])
        E3(["Generate Formatted Questions & Distractor Options"])
        E4(["Generate Explanations for Correct Answers"])
        E5(["Evaluate Written/Text User Responses"])
    end

    AI --> E1
    AI --> E2
    AI --> E3
    AI --> E4
    AI --> E5
```

- **[View AI Engine Use-case SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_ai_engine_usecase.svg)**

![QuestAI AI Engine Use Case](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_ai_engine_usecase.svg)

