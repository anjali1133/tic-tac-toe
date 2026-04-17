#!/bin/bash
set -e

echo "🎮 Starting Nakama server for Railway deployment..."

# Railway environment variables
export NAKAMA_SERVER_KEY=${NAKAMA_SERVER_KEY:-"defaultkey"}
export NAKAMA_PORT=${PORT:-${NAKAMA_PORT:-"7350"}}
export NAKAMA_ADDRESS=${NAKAMA_ADDRESS:-"0.0.0.0"}

# Database configuration
# Railway PostgreSQL format: postgresql://user:pass@host:port/db
export DATABASE_URL=${DATABASE_URL:-""}
export NAKAMA_DB_ADDRESS=${NAKAMA_DB_ADDRESS:-"$DATABASE_URL"}

echo "🔧 Configuration:"
echo "   Server Key: $NAKAMA_SERVER_KEY"
echo "   Port: $NAKAMA_PORT"
echo "   Address: $NAKAMA_ADDRESS"

# Check if database is available
if [ -n "$NAKAMA_DB_ADDRESS" ] && [ "$NAKAMA_DB_ADDRESS" != "" ]; then
    echo "🗄️  Using external PostgreSQL database"
    echo "   DB Address: $NAKAMA_DB_ADDRESS"
    
    # Run database migrations
    echo "🔄 Running database migrations..."
    /nakama/nakama migrate up --database.address "$NAKAMA_DB_ADDRESS" || {
        echo "⚠️  Database migration failed, continuing anyway..."
    }
    
    # Start Nakama server with database
    echo "🚀 Starting Nakama with PostgreSQL database..."
    exec /nakama/nakama \
        --name "nakama-railway" \
        --database.address "$NAKAMA_DB_ADDRESS" \
        --logger.level INFO \
        --logger.stdout true \
        --session.token_expiry_sec 7200 \
        --socket.server_key "$NAKAMA_SERVER_KEY" \
        --socket.port "$NAKAMA_PORT" \
        --socket.address "$NAKAMA_ADDRESS" \
        --console.port 7351 \
        --console.address "$NAKAMA_ADDRESS" \
        --runtime.js_entrypoint "match.js"
        
else
    echo "💾 Using embedded SQLite database (development mode)"
    echo "⚠️  Note: SQLite data will be lost on Railway restart!"
    
    # Start Nakama server with SQLite
    echo "🚀 Starting Nakama with SQLite..."
    exec /nakama/nakama \
        --name "nakama-railway-sqlite" \
        --logger.level INFO \
        --logger.stdout true \
        --session.token_expiry_sec 7200 \
        --socket.server_key "$NAKAMA_SERVER_KEY" \
        --socket.port "$NAKAMA_PORT" \
        --socket.address "$NAKAMA_ADDRESS" \
        --console.port 7351 \
        --console.address "$NAKAMA_ADDRESS" \
        --runtime.js_entrypoint "match.js"
fi