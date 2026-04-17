#!/bin/bash

echo "🚂 Railway Nakama Deployment Script"
echo "=================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "📦 Install it with: npm install -g @railway/cli"
    echo "🔗 Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

echo "✅ Railway CLI found"

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    echo "   railway login"
    exit 1
fi

echo "✅ Logged into Railway as: $(railway whoami)"

echo ""
echo "🎯 This script will:"
echo "   1. Deploy PostgreSQL database (if not exists)"
echo "   2. Deploy Nakama server using Dockerfile.railway"
echo "   3. Configure environment variables"
echo "   4. Show you the deployment URL"
echo ""

read -p "❓ Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting Railway deployment..."

# Initialize Railway project if needed
if [ ! -f "railway.toml" ]; then
    echo "📝 No railway.toml found, initializing project..."
    railway login
fi

# Check current project
echo "📊 Current Railway project:"
railway status

echo ""
echo "🗄️  Deploying PostgreSQL database..."
echo "💡 If database already exists, this will be skipped"

# Create database service
railway add --database postgresql 2>/dev/null || echo "ℹ️  Database might already exist"

echo ""
echo "🎮 Deploying Nakama server..."

# Set environment variables for Nakama service
railway variables set PORT=7350
echo "✅ Set PORT=7350"

# Deploy the Nakama service
echo "📦 Building and deploying Nakama server..."
railway up --detach

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get the deployment URL
RAILWAY_URL=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️  Could not automatically detect Railway URL"
    echo "🌐 Please check your Railway dashboard for the deployment URL"
    echo "🔗 https://railway.app/dashboard"
else
    echo "✅ Deployment successful!"
    echo "🌐 Nakama server URL: $RAILWAY_URL"
    
    # Extract domain from URL
    RAILWAY_DOMAIN=$(echo $RAILWAY_URL | sed 's|https://||')
    
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Update your frontend configuration:"
    echo "      ./update-frontend-config.sh $RAILWAY_DOMAIN"
    echo "   2. Redeploy your frontend to Vercel"
    echo "   3. Test the connection!"
    echo ""
    echo "🧪 Test the server:"
    echo "   curl $RAILWAY_URL"
fi

echo ""
echo "📊 Checking deployment status..."
railway status

echo ""
echo "📝 View logs with:"
echo "   railway logs"
echo ""
echo "🎯 Railway Dashboard:"
echo "   https://railway.app/dashboard"