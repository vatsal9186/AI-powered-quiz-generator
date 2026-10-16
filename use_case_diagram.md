# QuestAI - System Use-Case Diagram

This document outlines the system boundary, user roles (actors), and their respective actions (use cases) within the QuestAI quiz generator application.

## 1. Actors Definition

- **Guest / Visitor**: Unauthenticated users exploring the landing page, register processes, or public features.
- **Registered User**: Logged-in users who upload source materials, generate and attempt quizzes, and manage performance metrics.
- **Admin**: System administrators who manage users, configure systems, moderate generated content, and view overall analytics.
- **AI Engine (System Actor)**: Automated background service (Gemini AI API) that parses document text, generates questions, and provides answer explanations.

---

## 2. Interactive Mermaid Use-Case Diagram

```mermaid
graph LR
    subgraph Actors
        Visitor["👤 Guest Visitor"]
        User["👨‍🎓 Registered User"]
        Admin["🛠️ System Admin"]
        AI["🤖 Gemini AI Engine"]
    end

    subgraph QuestAI_System ["QuestAI Platform System Boundary"]
        UC1(["Register / Login (User)"])
        UC2(["Google OAuth Login"])
        UC3(["Upload Document / Source Material"])
        UC4(["Extract & Structure Document (Modules/Chapters)"])
        UC5(["Generate AI Quiz"])
        UC6(["Take Quiz Attempt"])
        UC7(["View Instant Grading & Explanations"])
        UC8(["Admin Login & Authentication"])
        UC9(["View Platform Dashboard Analytics"])
        UC10(["Manage & Moderate Users"])
        UC11(["Moderate Quizzes & Questions"])
    end

    Visitor --> UC1
    Visitor --> UC2
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC5
    User --> UC6
    User --> UC7

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    UC3 -.->|Triggers| UC4
    UC4 --> AI
    UC5 <-->|Generates Content| AI
    UC7 <-->|Provides Explanations| AI
```

---

## 3. Visual Diagram Assets

### Vector Diagram (SVG)
- **[View QuestAI UML SVG Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_usecase_diagram.svg)**

![QuestAI UML Use Case](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_usecase_diagram.svg)

---

### High-Resolution Rendered Layout (JPG)
Below is the rendered image showing the visual use case layout:

![QuestAI Use Case Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/use_case_diagram.jpg)


