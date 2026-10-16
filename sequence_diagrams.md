# QuestAI - Sequence Diagrams

This document contains standard UML Sequence Diagrams illustrating the chronological interactions between components (Actors, System logic, and Database records) for **QuestAI**.

These diagrams are modeled based on your sequence diagram references for a food ordering system, but adapted to fit the specific features of your AI Quiz Generator.

---

## 1. Admin Sequence Diagram

The Admin sequence diagram traces how an administrator performs validation checks and modifies configuration settings or moderates platform content.

*   **Objects involved:** `Admin` (Actor), `System` (Web Server/API layer), and `Database` (Persistence layer).
*   **Workflow traced:**
    1.  **Login** validation against the Database.
    2.  **Manage Users** by querying and displaying account directories.
    3.  **Moderate Content** by flagging or deleting bad materials/quizzes.
    4.  **Configure System Settings** by saving API limits and parameters.
    5.  **View Platform Analytics** by plotting server metrics.
    6.  **Monitor Error Logs** to keep track of bugs.
    7.  **Logout** to terminate session.

- **[View Admin Sequence Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_sequence.svg)**

![Admin Sequence Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_sequence.svg)

---

## 2. User Sequence Diagram

The User sequence diagram traces the operations of a registered user (combining creator and taker actions) without bookmarks.

*   **Objects involved:** `User` (Actor), `System` (Web Server/API layer), and `Database` (Persistence layer).
*   **Workflow traced:**
    1.  **Registration** saving credentials to DB.
    2.  **Login** checking credentials and returning an auth token.
    3.  **Browse Public Quizzes** querying the general database list.
    4.  **Upload Document / URL** saving upload details.
    5.  **Generate Quiz (AI)** running background workers and saving generated questions/options.
    6.  **Attempt Quiz** sending quiz choices to system storage.
    7.  **Review Score** fetching instantaneous attempt metrics and explanations.
    8.  **View Dashboard Analytics** loading long-term performance statistics.
    9.  **Logout** to terminate session.

- **[View User Sequence Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_user_sequence.svg)**

![User Sequence Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_user_sequence.svg)
