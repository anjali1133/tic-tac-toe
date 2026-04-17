const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Simple health check server for deployment platforms
const server = http.createServer((req, res) => {
  // Handle health checks
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      service: 'tic-tac-toe-nakama-backend',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle main info endpoint
  if (req.url === '/') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      message: 'Tic-tac-toe Backend Service',
      service: 'Health Check & API Info Server',
      status: 'running',
      port: PORT,
      endpoints: {
        health: '/health',
        info: '/'
      },
      note: 'This is a lightweight health check service for deployment platforms',
      gameServer: {
        info: 'Full Nakama game server runs on port 7350 with docker-compose',
        development: 'Use "docker-compose up" for local game development',
        websocket: 'ws://localhost:7350 (when running via docker-compose)',
        grpc: 'localhost:7349 (when running via docker-compose)'
      },
      frontend: {
        note: 'Configure your frontend to connect to the appropriate game server',
        local: 'http://localhost:7350',
        production: 'Set REACT_APP_NAKAMA_HOST to your production Nakama server'
      }
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

  // For all other requests, return 404
  res.writeHead(404, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: 'Endpoint not found',
    availableEndpoints: ['/', '/health']
  }));
});

console.log('🎮 Tic-tac-toe backend service starting...');
console.log(`🔗 Server will run on port ${PORT}`);
console.log('📡 This service provides health checks and API information');
console.log('💡 Note: This is a health check service. For full Nakama game server, use docker-compose up');
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

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