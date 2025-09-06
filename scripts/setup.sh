#!/bin/bash

# QuizMaster Pro Setup Script
echo "🚀 Setting up QuizMaster Pro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB 6+ or use Docker."
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. Please install Redis or use Docker."
fi

echo "✅ Prerequisites check completed."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env file. Please update with your configuration."
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
EOF
    echo "📝 Created frontend/.env file. Please update with your configuration."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p frontend/public/images

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Update frontend/.env with your API keys"
echo "3. Start MongoDB and Redis services"
echo "4. Run 'npm run dev' in both backend and frontend directories"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
echo ""
echo "Happy coding! 🚀"
