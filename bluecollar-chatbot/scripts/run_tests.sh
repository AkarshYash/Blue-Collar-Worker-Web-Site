#!/usr/bin/env bash
# Run all backend tests
# Created by Akarsh Chaturvedi
set -e

echo "🧪 Running BlueCollar Chatbot Tests..."
cd ../backend
pytest tests/ -v --tb=short
echo "✅ All tests passed."
