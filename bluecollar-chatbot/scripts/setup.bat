@echo off
REM BlueCollar Chatbot v2 — Windows setup script
REM Created by Akarsh Chaturvedi

echo.
echo  BlueCollar Chatbot v2 - Windows Setup
echo  ========================================

REM 1. Copy env
if not exist "..\\.env" (
  copy "..\\.env.example" "..\\.env"
  echo [OK] .env created - fill in your API keys.
) else (
  echo [OK] .env already exists.
)

REM 2. Backend
echo.
echo [..] Installing backend dependencies...
cd ..\backend
pip install -r requirements.txt
echo [OK] Backend dependencies installed.

REM 3. Frontend
echo.
echo [..] Installing frontend dependencies...
cd ..\frontend
npm install
echo [OK] Frontend dependencies installed.

echo.
echo  Setup complete!
echo.
echo  To start manually:
echo    Terminal 1: cd backend ^& uvicorn app.main:app --reload --port 8000
echo    Terminal 2: cd frontend ^& npm run dev
echo.
echo  Or with Docker:
echo    docker compose up --build
echo.
echo  URLs:
echo    Frontend : http://localhost:3000
echo    API      : http://localhost:8000
echo    API Docs : http://localhost:8000/docs
echo    Health   : http://localhost:8000/health
echo.
pause
