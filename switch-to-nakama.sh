#!/bin/bash

echo "🔄 Switching Railway deployment to Nakama server..."
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "📦 Install it with: npm install -g @railway/cli"
    echo ""
    echo "🌐 Or use the web dashboard method:"
    echo "   1. Go to railway.app/dashboard"
    echo "   2. Select your project"
    echo "   3. Click on your service"
    echo "   4. Go to Settings → Build"
    echo "   5. Set Dockerfile Path to: Dockerfile.railway"
    echo "   6. Deploy"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI ready"

# Link to project if needed
if [ ! -f "railway.toml" ] && [ ! -f ".railway" ]; then
    echo "🔗 Linking to Railway project..."
    railway link
fi

echo ""
echo "📋 Current Railway status:"
railway status

echo ""
echo "🗄️  Adding PostgreSQL database (if not exists)..."
railway add --database postgresql 2>/dev/null || echo "ℹ️  Database already exists or creation failed"

echo ""
echo "🎮 Setting up Nakama server configuration..."

# Set required environment variables
railway variables set PORT=7350
echo "✅ Set PORT=7350"

# Deploy using the Nakama Dockerfile
echo ""
echo "🚀 Deploying Nakama server (this may take a few minutes)..."
echo "📦 Using Dockerfile.railway for proper Nakama deployment..."

# Force deployment with specific Dockerfile
railway up --dockerfile Dockerfile.railway --detach

echo ""
echo "⏳ Deployment started. Checking status..."
sleep 15

# Check deployment status
echo "📊 Current deployment status:"
railway status

echo ""
echo "🧪 Testing deployment..."
RAILWAY_URL=$(railway domain 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -n "$RAILWAY_URL" ]; then
    echo "🌐 Testing: $RAILWAY_URL"
    
    # Test the endpoint
    echo "📡 Server response:"
    curl -s "$RAILWAY_URL" | head -n 10
    
    echo ""
    echo "✅ If you see Nakama server response above (not health check), the fix worked!"
    echo "❌ If you still see health check message, check Railway logs for errors"
else
    echo "⚠️  Could not get Railway URL automatically"
    echo "🔗 Check your Railway dashboard: https://railway.app/dashboard"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Verify Nakama is running (not health check service)"
echo "   2. Update frontend config: ./update-frontend-config.sh YOUR_RAILWAY_URL"
echo "   3. Redeploy frontend to Vercel"
echo ""
echo "🔍 View logs: railway logs"
echo "🌐 Dashboard: https://railway.app/dashboard"