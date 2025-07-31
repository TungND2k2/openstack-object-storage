@echo off
REM OpenStack Swift Object Storage API Startup Script for Windows

echo 🚀 Starting OpenStack Swift Object Storage API...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if Docker is installed (for MongoDB)
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not installed. You'll need to start MongoDB manually.
) else (
    echo 🐳 Starting MongoDB with Docker...
    docker-compose up -d mongodb
    
    REM Wait for MongoDB to be ready
    echo ⏳ Waiting for MongoDB to be ready...
    timeout /t 10 /nobreak
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the project
echo 🔨 Building the project...
npm run build

REM Start the development server
echo 🚀 Starting development server...
npm run start:dev

pause
