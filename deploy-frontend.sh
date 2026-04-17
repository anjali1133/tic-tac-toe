#!/bin/bash

# Frontend Deployment Script for Tic-Tac-Toe
echo "🚀 Deploying Tic-Tac-Toe Frontend..."

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for production
echo "🔨 Building production version..."
NODE_ENV=production npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"
echo "📁 Build files are in: frontend/build/"
echo ""
echo "🌐 Backend URL: tic-tac-toe-production-8a4c.up.railway.app"
echo ""
echo "Next steps:"
echo "1. Deploy the 'build' folder to your hosting service (Vercel, Netlify, etc.)"
echo "2. Or serve locally with: npm run serve"

# Optional: Start local server to test
read -p "🔍 Would you like to start a local server to test? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting local server on http://localhost:3000..."
    npm run serve
fi