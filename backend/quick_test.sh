#!/bin/bash

# Simple test to verify API is working
echo "Testing API endpoints..."

# Start server in background if not running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "Starting server..."
    cd /Users/jm237/Desktop/copilot-test-framework/backend
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    SERVER_PID=$!
    echo "Server started with PID: $SERVER_PID"
    sleep 5
fi

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:8000/health | jq .

# Test extraction endpoint
echo "Testing extraction endpoint..."
curl -s -X POST "http://localhost:8000/extract/url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/forms/post", "wait_for_js": false, "timeout": 30}' | jq .

echo "Done!"
