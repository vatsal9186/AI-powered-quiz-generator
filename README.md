# QuestAI - AI-Powered Quiz Generator

An intelligent, multi-tier application that extracts learning material from textbooks, PDFs, and documents, automatically generates structured quizzes with multiple difficulty levels using Google Gemini AI, and provides detailed analytics for both students and administrators.

---

## Architecture Overview

- **User Frontend (`client/`)**: Built with React 19, Vite, and Tailwind-inspired styling. Allows users to take quizzes, upload study documents, and track progress.
- **Admin Dashboard (`admin/`)**: Built with React 19 and Vite. Allows administrators to monitor active users, inspect quizzes, review performance analytics, and manage assessments.
- **Backend API (`server/`)**: Built with Python FastAPI, SQLAlchemy, and Uvicorn. Integrates Gemini AI for question generation and chapter extraction, with automated database migrations.
- **Database**: Cloud PostgreSQL (Supabase / Neon) with automated local SQLite fallback.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Lucide Icons
- **Backend**: FastAPI, Uvicorn, Python 3.10+
- **AI / LLM**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5`)
- **Database ORM**: SQLAlchemy, Alembic, PostgreSQL / SQLite
- **Security**: JWT (OAuth2 with Password Bearer), Passlib (Bcrypt), OTP Verification
- **Hosting**:
  - Frontend & Admin: Vercel
  - Backend: Render
  - Database: Supabase

---

## Project Structure

```
├── client/              # Student/User React application (Vite)
├── admin/               # Administrator dashboard (Vite)
├── server/              # FastAPI Python backend
│   ├── app/
│   │   ├── models.py    # Database models
│   │   ├── routers/     # API route handlers
│   │   └── services/   # Gemini AI & document extraction
│   └── requirements.txt
├── sample_books/        # Sample study textbooks & papers for testing
├── run.bat              # One-click startup script for local development
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### 2. Quick Start (Windows)
Double-click `run.bat` in the root folder to start all three services simultaneously:
- Backend: `http://localhost:8000`
- User Client: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`

---

## Production Deployment

- **Database**: Supabase PostgreSQL
- **Backend**: Render Web Service (`sem 3 project AI powered quiz generator/server` or `server/`)
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Frontends**: Vercel Static Sites (`client` & `admin`)
  - Build Command: `npm run build`
  - Output Directory: `dist`
