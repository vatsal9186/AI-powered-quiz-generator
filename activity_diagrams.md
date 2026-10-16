# QuestAI - Activity Diagrams

This document contains standard UML Activity Diagrams outlining the workflows for the **Admin** and **User** (incorporating both Quiz Creator and Quiz Taker roles) in the QuestAI system. 

These diagrams are modeled to follow the exact structured flow of your reference images (incorporating registration checks, login verification, fork-join parallel processing columns, and logout flows), tailored specifically for the features of **QuestAI**.

---

## 1. Admin Activity Diagram

The Admin's activity diagram starts with the login flow, verifies credentials, and then forks into the administrative actions:
*   **Manage Users** (approving, suspending, or reviewing user accounts).
*   **Moderate Content** $\rightarrow$ **Delete Flagged Items** (managing quizzes or uploaded materials that have been reported or flagged).
*   **Configure AI API** (adjusting API keys, token limits, and model parameters).
*   **Monitor Analytics** (monitoring server logs, platform traffic, and usage metrics).

After completing these activities, the Admin logs out and ends the session.

- **[View Admin Activity Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_activity.svg)**

![Admin Activity Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_admin_activity.svg)

---

## 2. User Activity Diagram

The User's activity diagram maps out the complete journey of a registered user (who acts as both a Quiz Creator and Taker). It starts by checking if the user is new, flows through registration if needed, validates the login, and forks into four parallel capabilities:
*   **Browse Quizzes** (exploring the platform's public quizzes database).
*   **View Analytics** (checking past performance scores, progress tracking, and weaknesses).
*   **Upload Material** $\rightarrow$ **Generate Quiz (AI)** (uploading documents/URLs to automatically generate a quiz).
*   **Attempt Quiz** $\rightarrow$ **Review Score** (solving quizzes and viewing instantaneous grades and explanations).

After completing these tasks, the user logs out and ends the session.

- **[View User Activity Diagram SVG](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_user_activity.svg)**

![User Activity Diagram](file:///d:/sem%203%20project%20AI%20powered%20quiz%20generator/questai_user_activity.svg)
