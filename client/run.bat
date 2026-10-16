@echo off
title Vite React Frontend
echo [INFO] Starting Vite React Frontend on http://localhost:5173 ...
npm run dev
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start frontend server.
    pause
)
