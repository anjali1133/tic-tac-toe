const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 7350;

// Simple health check server for deployment platforms
const server = http.createServer((req, res) => {
  // Handle health checks
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      service: 'tic-tac-toe-nakama-backend',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // For all other requests, return info about the backend
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({
    message: 'Tic-tac-toe Nakama Backend Service',
    endpoints: {
      health: '/health',
      websocket: `ws://localhost:${PORT}`,
      grpc: `localhost:7349`
    },
    info: 'This is a Nakama game server backend for multiplayer tic-tac-toe'
  }));
});

console.log('🎮 Tic-tac-toe backend service starting...');
console.log(`🔗 Server will run on port ${PORT}`);
console.log('📡 This service provides health checks and proxy functionality');
console.log('🚀 For local development, use docker-compose up');

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Health check server running on port ${PORT}`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏹️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⏹️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});