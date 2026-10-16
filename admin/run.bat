@echo off
title Vite React Admin Panel
echo [INFO] Starting Vite React Admin Panel on http://localhost:5174 ...
npm run dev
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start admin server.
    pause
)
