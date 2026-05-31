#!/usr/bin/env bash
# BlueCollar Chatbot v2 — one-shot local setup (Linux/macOS)
# Created by Akarsh Chaturvedi
set -e

echo "🤖 BlueCollar Chatbot v2 — Setup"
echo "=================================="

# 1. Copy env file
if [ ! -f "../.env" ]; then
  cp ../.env.example ../.env
  echo "✅ .env created — fill in your API keys before starting."
else
  echo "✅ .env already exists."
fi

# 2. Backend
echo ""
echo "📦 Installing backend dependencies..."
cd ../backend
pip install -r requirements.txt
echo "✅ Backend ready."

# 3. Frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend ready."

echo ""
echo "🚀 Setup complete! To start:"
echo ""
echo "  Docker (recommended):"
echo "    docker compose up --build"
echo ""
echo "  Manual:"
echo "    Terminal 1: cd backend && uvicorn app.main:app --reload --port 8000"
echo "    Terminal 2: cd frontend && npm run dev"
echo ""
echo "  URLs:"
echo "    Frontend:  http://localhost:3000"
echo "    API:       http://localhost:8000"
echo "    API Docs:  http://localhost:8000/docs"
echo "    Health:    http://localhost:8000/health"
echo "    Metrics:   http://localhost:8000/metrics"
