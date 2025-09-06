#!/bin/bash

echo "🚀 Starting QuizMaster Pro on custom ports..."
echo "Frontend: http://localhost:3002"
echo "Backend: http://localhost:5002"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Starting with Docker..."
    docker-compose up -d
    echo ""
    echo "✅ Application started!"
    echo "Frontend: http://localhost:3002"
    echo "Backend API: http://localhost:5002"
    echo "Health Check: http://localhost:5002/health"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
else
    echo "📦 Docker not available. Starting manually..."
    echo ""
    echo "Please run these commands in separate terminals:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "cd backend && npm start"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "cd frontend && PORT=3002 npm start"
    echo ""
    echo "Then visit:"
    echo "Frontend: http://localhost:3002"
    echo "Backend: http://localhost:5002"
fi
