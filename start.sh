#!/bin/bash
set -e

echo "Starting Nakama server..."

# Set default values if environment variables are not set
export NAKAMA_SERVER_KEY=${NAKAMA_SERVER_KEY:-"defaultkey"}
export NAKAMA_PORT=${NAKAMA_PORT:-"7350"}

# Check if database address is provided
if [ -n "$NAKAMA_DB_ADDRESS" ]; then
    echo "Using external database: $NAKAMA_DB_ADDRESS"
    # Run database migrations
    echo "Running database migrations..."
    /nakama/nakama migrate up --database.address "$NAKAMA_DB_ADDRESS" || {
        echo "Warning: Database migration failed or not needed, continuing..."
    }
    
    # Start Nakama server with external database
    echo "Starting Nakama with external database..."
    exec /nakama/nakama \
        --name nakama1 \
        --database.address "$NAKAMA_DB_ADDRESS" \
        --logger.level INFO \
        --session.token_expiry_sec 7200 \
        --socket.server_key "$NAKAMA_SERVER_KEY" \
        --socket.port "$NAKAMA_PORT" \
        --socket.address "0.0.0.0" \
        --metrics.prometheus_port 9100 \
        --runtime.js_entrypoint "match.js"
else
    echo "Starting Nakama in single-node mode (no external database)..."
    # Start Nakama server without database (uses embedded SQLite)
    exec /nakama/nakama \
        --name nakama1 \
        --logger.level INFO \
        --session.token_expiry_sec 7200 \
        --socket.server_key "$NAKAMA_SERVER_KEY" \
        --socket.port "$NAKAMA_PORT" \
        --socket.address "0.0.0.0" \
        --metrics.prometheus_port 9100 \
        --runtime.js_entrypoint "match.js"
fi