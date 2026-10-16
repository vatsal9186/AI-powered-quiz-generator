@echo off
title QuestAI Application Starter
echo ==========================================
echo Starting QuestAI Application Suite...
echo ==========================================

echo [INFO] Starting FastAPI Backend in a new window...
start cmd /k "cd server && run.bat"

echo [INFO] Starting React Frontend in a new window...
start cmd /k "cd client && run.bat"

echo [INFO] Starting React Admin Panel in a new window...
start cmd /k "cd admin && run.bat"

echo [SUCCESS] All servers (Backend, Client, and Admin) are starting up! Check the new windows.
timeout /t 5
