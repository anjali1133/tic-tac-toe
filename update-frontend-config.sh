#!/bin/bash

# Script to update frontend configuration for Render deployment
echo "🔧 Updating frontend configuration for Render deployment..."

# Check if Render URL is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your Render Nakama service URL"
    echo "Usage: $0 <render-nakama-url>"
    echo "Example: $0 tic-tac-toe-nakama.onrender.com"
    exit 1
fi

RENDER_URL=$1

# Remove https:// if included
RENDER_URL=${RENDER_URL#https://}
RENDER_URL=${RENDER_URL#http://}

echo "🌐 Render Nakama URL: $RENDER_URL"

# Update production environment file
cat > frontend/.env.production << EOF
REACT_APP_NAKAMA_HOST=$RENDER_URL
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_USE_SSL=true
EOF

# Update Vercel configuration
cat > frontend/vercel.json << EOF
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/\$1"
    },
    {
      "src": "/(.*\\\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/\$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_NAKAMA_HOST": "$RENDER_URL",
    "REACT_APP_NAKAMA_PORT": "7350", 
    "REACT_APP_NAKAMA_USE_SSL": "true"
  }
}
EOF

# Update Netlify configuration
cat > frontend/netlify.toml << EOF
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_NAKAMA_HOST = "$RENDER_URL"
  REACT_APP_NAKAMA_PORT = "7350"
  REACT_APP_NAKAMA_USE_SSL = "true"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

echo "✅ Frontend configuration updated!"
echo ""
echo "📁 Files updated:"
echo "  - frontend/.env.production"
echo "  - frontend/vercel.json" 
echo "  - frontend/netlify.toml"
echo ""
echo "🚀 Next steps:"
echo "  1. Deploy your backend to Render"
echo "  2. Run: cd frontend && npx vercel --prod"
echo "  3. Test your multiplayer game!"