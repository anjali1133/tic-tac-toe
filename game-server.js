const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Game state management
const gameRooms = new Map();
const playerSessions = new Map();

class GameRoom {
  constructor(id) {
    this.id = id;
    this.board = Array(9).fill(null);
    this.players = [];
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
  }

  addPlayer(playerId, ws) {
    if (this.players.length < 2) {
      const symbol = this.players.length === 0 ? 'X' : 'O';
      this.players.push({ id: playerId, symbol, ws });
      return symbol;
    }
    return null;
  }

  makeMove(playerId, index) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.gameOver || this.board[index] !== null) {
      return false;
    }
    
    if (player.symbol !== this.currentPlayer) {
      return false;
    }

    this.board[index] = this.currentPlayer;
    
    // Check for winner
    if (this.checkWinner()) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
    } else if (this.board.every(cell => cell !== null)) {
      this.gameOver = true;
      this.winner = 'draw';
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    return true;
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    return winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
    });
  }

  broadcast(message) {
    this.players.forEach(player => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message));
      }
    });
  }
}

// HTTP server for health checks
const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  if (req.url === '/health') {
    res.end(JSON.stringify({ 
      status: 'healthy', 
      service: 'tic-tac-toe-game-server',
      activeGames: gameRooms.size,
      timestamp: new Date().toISOString() 
    }));
  } else {
    res.end(JSON.stringify({
      message: 'Tic-tac-toe Game Server',
      service: 'WebSocket Game Server',
      status: 'running',
      activeGames: gameRooms.size,
      websocket: `wss://${req.headers.host || 'localhost:' + PORT}`,
      endpoints: {
        health: '/health',
        websocket: '/ws'
      }
    }));
  }
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  let playerId = null;
  let roomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message);

      switch (message.type) {
        case 'join_game':
          playerId = message.playerId || `player_${Date.now()}`;
          roomId = message.roomId || 'default_room';
          
          if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, new GameRoom(roomId));
          }
          
          const room = gameRooms.get(roomId);
          const playerSymbol = room.addPlayer(playerId, ws);
          
          if (playerSymbol) {
            playerSessions.set(ws, { playerId, roomId });
            
            ws.send(JSON.stringify({
              type: 'game_joined',
              playerId,
              symbol: playerSymbol,
              board: room.board,
              currentPlayer: room.currentPlayer,
              players: room.players.length
            }));

            room.broadcast({
              type: 'game_state',
              board: room.board,
              currentPlayer: room.currentPlayer,
              players: room.players.length,
              gameOver: room.gameOver,
              winner: room.winner
            });
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Game room is full'
            }));
          }
          break;

        case 'make_move':
          if (playerId && roomId) {
            const room = gameRooms.get(roomId);
            if (room && room.makeMove(playerId, message.index)) {
              room.broadcast({
                type: 'game_state',
                board: room.board,
                currentPlayer: room.currentPlayer,
                gameOver: room.gameOver,
                winner: room.winner,
                lastMove: {
                  player: playerId,
                  index: message.index
                }
              });
            } else {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid move'
              }));
            }
          }
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    
    if (playerSessions.has(ws)) {
      const session = playerSessions.get(ws);
      const room = gameRooms.get(session.roomId);
      
      if (room) {
        room.players = room.players.filter(p => p.id !== session.playerId);
        
        if (room.players.length === 0) {
          gameRooms.delete(session.roomId);
        } else {
          room.broadcast({
            type: 'player_left',
            playerId: session.playerId
          });
        }
      }
      
      playerSessions.delete(ws);
    }
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to tic-tac-toe game server'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🎮 Tic-tac-toe Game Server running');
  console.log(`🔗 HTTP server on port ${PORT}`);
  console.log(`🌐 WebSocket server ready`);
  console.log(`🎯 Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('⏹️  Shutting down gracefully...');
  wss.close(() => {
    server.close(() => {
      console.log('✅ Server closed.');
      process.exit(0);
    });
  });
});

module.exports = server;