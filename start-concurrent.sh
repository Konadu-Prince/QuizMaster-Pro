#!/bin/bash

echo "🚀 Starting QuizMaster Pro - Concurrent Mode"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to start backend
start_backend() {
    echo -e "${BLUE}📦 Starting Backend Server (Port 5002)...${NC}"
    cd backend
    PORT=5002 node ../minimal-server.js &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    cd ..
}

# Function to start frontend (if dependencies are available)
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend Server (Port 3002)...${NC}"
    cd frontend
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        PORT=3002 npm start &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend dependencies not installed.${NC}"
        echo -e "${YELLOW}   Starting simple HTTP server instead...${NC}"
        PORT=3002 python3 -m http.server 3002 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Simple HTTP server started with PID: $FRONTEND_PID${NC}"
    fi
    cd ..
}

# Function to check if ports are available
check_ports() {
    echo -e "${BLUE}🔍 Checking port availability...${NC}"
    
    if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port 5002 is already in use${NC}"
        return 1
    fi
    
    if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port 3002 is already in use${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Ports 5002 and 3002 are available${NC}"
    return 0
}

# Function to wait for services to start
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
    sleep 3
    
    # Check backend
    if curl -s http://localhost:5002/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is responding${NC}"
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:3002 > /dev/null; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend is not responding (may need dependencies)${NC}"
    fi
}

# Function to show access information
show_access_info() {
    echo ""
    echo -e "${GREEN}🎉 QuizMaster Pro is now running!${NC}"
    echo "=============================================="
    echo -e "${BLUE}🌐 Access URLs:${NC}"
    echo -e "   Backend API: ${YELLOW}http://localhost:5002${NC}"
    echo -e "   Frontend:    ${YELLOW}http://localhost:3002${NC}"
    echo -e "   Health Check: ${YELLOW}http://localhost:5002/health${NC}"
    echo -e "   Demo Page:   ${YELLOW}http://localhost:5002${NC}"
    echo ""
    echo -e "${BLUE}📊 Process IDs:${NC}"
    echo -e "   Backend PID: ${YELLOW}$BACKEND_PID${NC}"
    echo -e "   Frontend PID: ${YELLOW}$FRONTEND_PID${NC}"
    echo ""
    echo -e "${BLUE}🛑 To stop all services:${NC}"
    echo -e "   ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
    echo -e "   or press ${YELLOW}Ctrl+C${NC}"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${RED}🛑 Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    if ! check_ports; then
        echo -e "${RED}❌ Cannot start services - ports are in use${NC}"
        exit 1
    fi
    
    start_backend
    start_frontend
    wait_for_services
    show_access_info
    
    echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main
