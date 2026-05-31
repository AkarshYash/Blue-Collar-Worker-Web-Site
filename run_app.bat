@echo off
echo =======================================================
echo Starting BlueCollar Full Stack Pure Python Marketplace
echo =======================================================

echo [1/2] Starting Chatbot Backend (Port 8000)...
start cmd /k "title Chatbot Backend && cd bluecollar-chatbot\backend && pip install setuptools && pip install -r requirements.txt && python -m uvicorn app.main:app --port 8000"

echo [2/2] Starting Platform Backend (Port 8001)...
start cmd /k "title Platform Backend && cd backend && pip install setuptools && pip install -r requirements.txt && python -m uvicorn app.main:app --port 8001"

echo Waiting for services to initialize (3 seconds)...
timeout /t 3 /nobreak >nul

echo Opening the BlueCollar AI Marketplace in your default browser...
start http://localhost:8001

echo Done! You can close this window.
