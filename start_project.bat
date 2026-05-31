@echo off
echo =======================================================
echo Starting BlueCollar Full Stack Pure Python Marketplace
echo =======================================================

echo [1/2] Starting Chatbot Backend (Port 8000)...
start cmd /k "title Chatbot Backend && cd bluecollar-chatbot\backend && pip install setuptools && pip install -r requirements.txt && python -m uvicorn app.main:app --port 8000 --reload"

echo [2/2] Starting Platform Backend (Port 8001)...
start cmd /k "title Platform Backend && cd backend && pip install setuptools && pip install -r requirements.txt && python -m uvicorn app.main:app --port 8001 --reload"

echo.
echo All services are starting up in separate windows!
echo Once they load, you can access the marketplace at: http://localhost:8001
echo.
pause
