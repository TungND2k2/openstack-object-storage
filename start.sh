#!/bin/bash

# OpenStack Swift Object Storage API Startup Script

echo "🚀 Starting OpenStack Swift Object Storage API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Docker is installed (for MongoDB)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to start MongoDB manually."
else
    echo "🐳 Starting MongoDB with Docker..."
    docker-compose up -d mongodb
    
    # Wait for MongoDB to be ready
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Start the development server
echo "🚀 Starting development server..."
npm run start:dev
