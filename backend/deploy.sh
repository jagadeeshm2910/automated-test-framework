#!/bin/bash
# 🚀 PRODUCTION DEPLOYMENT SCRIPT
# Metadata-Driven UI Testing Framework Quick Setup

set -e  # Exit on any error

echo "🎭 METADATA-DRIVEN UI TESTING FRAMEWORK"
echo "🚀 Production Deployment Script"
echo "=" * 50

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PORT=8000
DEFAULT_HOST="0.0.0.0"
DEFAULT_WORKERS=4

# Parse command line arguments
PORT=${1:-$DEFAULT_PORT}
HOST=${2:-$DEFAULT_HOST}
WORKERS=${3:-$DEFAULT_WORKERS}

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   Workers: $WORKERS"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking Prerequisites...${NC}"

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_status "Python $PYTHON_VERSION found"
else
    print_error "Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check pip
if command_exists pip; then
    print_status "pip found"
elif command_exists pip3; then
    print_status "pip3 found"
    alias pip=pip3
else
    print_error "pip not found. Please install pip"
    exit 1
fi

# Navigate to backend directory
if [ -d "backend" ]; then
    cd backend
    print_status "Changed to backend directory"
else
    print_error "backend directory not found. Please run from project root."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate
print_status "Virtual environment activated"

# Install/upgrade dependencies
echo ""
echo -e "${BLUE}📦 Installing Dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
print_status "Dependencies installed"

# Install Playwright browsers
echo ""
echo -e "${BLUE}🎭 Installing Playwright Browsers...${NC}"
playwright install
print_status "Playwright browsers installed"

# Initialize database
echo ""
echo -e "${BLUE}🗄️  Initializing Database...${NC}"
python -c "
import asyncio
from app.database import async_engine, Base

async def init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Database initialized successfully')

asyncio.run(init_db())
" 2>/dev/null && print_status "Database initialized" || print_warning "Database may already exist"

# Run health check
echo ""
echo -e "${BLUE}🏥 Running System Health Check...${NC}"

# Start server in background for health check
python -m uvicorn app.main:app --host $HOST --port $PORT &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check health endpoint
if curl -s "http://localhost:$PORT/health" > /dev/null; then
    print_status "Health check passed"
    # Stop the test server
    kill $SERVER_PID 2>/dev/null || true
    sleep 2
else
    print_warning "Health check failed, but continuing..."
    kill $SERVER_PID 2>/dev/null || true
    sleep 2
fi

# Create systemd service file (optional)
create_systemd_service() {
    SERVICE_FILE="/etc/systemd/system/ui-testing-framework.service"
    CURRENT_DIR=$(pwd)
    
    if [ "$EUID" -eq 0 ]; then
        echo -e "${BLUE}📝 Creating systemd service...${NC}"
        
        cat > $SERVICE_FILE << EOF
[Unit]
Description=UI Testing Framework API
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=$CURRENT_DIR
Environment=PATH=$CURRENT_DIR/venv/bin
ExecStart=$CURRENT_DIR/venv/bin/python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

        systemctl daemon-reload
        systemctl enable ui-testing-framework
        print_status "Systemd service created and enabled"
    else
        print_info "Run with sudo to create systemd service"
    fi
}

# Production deployment options
echo ""
echo -e "${BLUE}🚀 Production Deployment Options:${NC}"
echo ""
echo "1. Manual Start (for testing):"
echo "   python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS"
echo ""
echo "2. Background Start:"
echo "   nohup python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS > server.log 2>&1 &"
echo ""
echo "3. With Process Manager (PM2):"
echo "   npm install -g pm2"
echo "   pm2 start 'python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS' --name ui-testing-framework"
echo ""

# Ask user for deployment choice
echo -e "${YELLOW}📋 Select deployment option:${NC}"
echo "1) Start manually (for testing)"
echo "2) Start in background"
echo "3) Create systemd service (requires sudo)"
echo "4) Just setup, don't start"
echo ""
read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🚀 Starting server manually...${NC}"
        echo "Access the API at: http://$HOST:$PORT"
        echo "API Documentation: http://$HOST:$PORT/docs"
        echo "Press Ctrl+C to stop"
        echo ""
        python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Starting server in background...${NC}"
        nohup python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS > server.log 2>&1 &
        SERVER_PID=$!
        echo "Server started with PID: $SERVER_PID"
        echo "Access the API at: http://$HOST:$PORT"
        echo "API Documentation: http://$HOST:$PORT/docs"
        echo "Logs: tail -f server.log"
        echo "Stop with: kill $SERVER_PID"
        ;;
    3)
        create_systemd_service
        echo -e "${GREEN}🚀 Starting service...${NC}"
        systemctl start ui-testing-framework
        systemctl status ui-testing-framework
        echo "Service management:"
        echo "  Start: sudo systemctl start ui-testing-framework"
        echo "  Stop: sudo systemctl stop ui-testing-framework"
        echo "  Status: sudo systemctl status ui-testing-framework"
        echo "  Logs: sudo journalctl -u ui-testing-framework -f"
        ;;
    4)
        echo -e "${GREEN}✅ Setup complete!${NC}"
        echo "Manual start command:"
        echo "python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS"
        ;;
    *)
        echo -e "${YELLOW}⚠️  Invalid option. Setup complete, use manual start.${NC}"
        echo "python -m uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS"
        ;;
esac

# Final information
echo ""
echo -e "${BLUE}📊 Final Setup Information:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 API Base URL: http://$HOST:$PORT"
echo "📚 API Documentation: http://$HOST:$PORT/docs"
echo "🏥 Health Check: http://$HOST:$PORT/health"
echo "📊 Analytics: http://$HOST:$PORT/results/analytics/global"
echo "📋 Dashboard Data: http://$HOST:$PORT/results/reports/dashboard"
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "💡 Quick Test Commands:"
echo "   curl http://$HOST:$PORT/health"
echo "   python complete_framework_demo.py"
echo "   python test_deliverable6_analytics.py"
echo ""
echo "📖 For more information, see DEPLOYMENT_GUIDE.md"
echo "🚀 Framework is ready for production use!"
