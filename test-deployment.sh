#!/bin/bash

echo "🧪 Testing Multiplayer Tic-Tac-Toe Deployment"
echo "=============================================="
echo ""

# Get URLs from user or use defaults
read -p "🌐 Enter your frontend URL (e.g., https://your-app.vercel.app): " FRONTEND_URL
read -p "🎮 Enter your Nakama server URL (e.g., https://your-server.onrender.com): " NAKAMA_URL

echo ""
echo "🔍 Testing deployment..."

# Test frontend
echo "1️⃣ Testing Frontend..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo "   ✅ Frontend is accessible at $FRONTEND_URL"
else
    echo "   ❌ Frontend test failed at $FRONTEND_URL"
fi

# Test Nakama server
echo "2️⃣ Testing Nakama Server..."
if curl -s -o /dev/null -w "%{http_code}" "$NAKAMA_URL" | grep -q "200"; then
    echo "   ✅ Nakama server is running at $NAKAMA_URL"
else
    echo "   ❌ Nakama server test failed at $NAKAMA_URL"
fi

# Test Nakama console (might be protected)
echo "3️⃣ Testing Nakama Console..."
CONSOLE_URL="${NAKAMA_URL}:7351"
if curl -s -o /dev/null -w "%{http_code}" "$CONSOLE_URL" | grep -q -E "(200|401|403)"; then
    echo "   ✅ Nakama console accessible at $CONSOLE_URL"
else
    echo "   ❌ Console test failed - this might be normal if port 7351 is not exposed"
fi

echo ""
echo "📱 Manual Testing Checklist:"
echo "   □ Open $FRONTEND_URL in two different browsers"
echo "   □ Enter different usernames in each"
echo "   □ Click 'Find Match' in both browsers"  
echo "   □ Verify players are matched automatically"
echo "   □ Test making moves in real-time"
echo "   □ Check 30-second turn timer"
echo "   □ View leaderboard functionality"
echo "   □ Test mobile responsiveness"
echo ""

echo "🎯 Key Features to Validate:"
echo "   ✅ Real-time multiplayer gameplay"
echo "   ✅ Server-side move validation (try cheating!)"
echo "   ✅ Turn timer with automatic forfeit"
echo "   ✅ Player statistics and leaderboard"
echo "   ✅ Mobile-responsive design"
echo "   ✅ Connection status indicators"
echo "   ✅ Graceful disconnect handling"
echo ""

echo "🆘 Troubleshooting:"
echo "   - Check browser console for WebSocket errors"
echo "   - Verify CORS settings if connection fails"
echo "   - Ensure environment variables are correct"
echo "   - Check cloud provider logs for server errors"
echo ""

echo "✨ If all tests pass, your game is production-ready!"
echo "📱 Share the URL with friends to test multiplayer!"