#!/bin/bash

# UI Testing Framework - Backend Startup Script

echo "🚀 Starting UI Testing Framework Backend..."
echo "========================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "🔌 Activating virtual environment..."
    source venv/bin/activate
else
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI server
echo "🔥 Starting FastAPI server on http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo "📚 ReDoc Documentation: http://localhost:8000/redoc"
echo "❤️  Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
