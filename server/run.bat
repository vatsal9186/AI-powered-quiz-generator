@echo off
title FastAPI Backend Server

echo [INFO] Ensuring PostgreSQL server is running...
sc query postgresql-x64-18 | find "RUNNING" >nul || net start postgresql-x64-18 >nul 2>&1
timeout /t 1 >nul

echo [INFO] Starting FastAPI Backend on http://127.0.0.1:8000 ...
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start backend server.
    pause
)
