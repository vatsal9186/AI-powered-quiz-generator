# QuestAI - Collaboration Diagram

This document contains a UML Collaboration Diagram (also known as a Communication Diagram) highlighting how components in **QuestAI** communicate, pass messages, and persist data. 

It is modeled after your food ordering system reference, displaying:
1.  **Actors** (on the left) sending requests to boundary modules.
2.  **System Boundary Modules** (in the middle box) routing actions.
3.  **Data Entities & Handlers** (on the right) receiving operations.
4.  **Database & External APIs** (at the bottom and far right) handling persistence and service calls.

---

## QuestAI Collaboration Flow

*   **Actors & Inbound Actions:**
    *   **User:** Sends messages like `register / login`, `browse quizzes`, `upload docs`, and `attempt quiz`.
    *   **Admin:** Sends messages like `manage users`, `moderate content`, and `configure AI API`.
*   **System Boundary Modules:**
    *   Acts as the central router that receives requests, coordinates services, and reads/writes to databases.
*   **Database (PostgreSQL):**
    *   Performs database transactions: `store data` and `retrieve data` to persist system state.
*   **Data Entities & Handlers:**
    *   **User Profile:** Handles `create user` processes.
    *   **Document / URL Resource:** Manages `store material details` for files and link uploads.
    *   **Generated Quiz:** Coordinates with the AI system to `save questions`.
    *   **Quiz Attempt:** Manages attempts to `record scores`.
    *   **System Configurations:** Receives settings configurations to `save configs`.
    *   **Audit Logs:** Records platform safety history to `write audit logs`.
    *   **AI Service Handler:** Coordinates with the `Gemini AI API` to `fetch questions` asynchronously during quiz generation.

---

- **[View Collaboration Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_collaboration.svg)**

![Collaboration Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_collaboration.svg)
