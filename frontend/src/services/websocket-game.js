// WebSocket Game Service (Railway-compatible alternative to Nakama)

class WebSocketGameService {
    constructor() {
        this.ws = null;
        this.gameState = {
            board: Array(9).fill(null),
            currentPlayer: 'X',
            gameOver: false,
            winner: null,
            playerSymbol: null,
            playerId: null
        };
        this.listeners = [];
        this.isConnected = false;
    }

    connect(host) {
        const wsUrl = `wss://${host}`;
        console.log('Connecting to:', wsUrl);
        
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = () => {
                    console.log('✅ WebSocket connected');
                    this.isConnected = true;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('Received message:', message);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('❌ WebSocket disconnected');
                    this.isConnected = false;
                    this.notifyListeners({ type: 'disconnected' });
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    joinGame(roomId = 'default_room') {
        if (!this.isConnected) {
            throw new Error('Not connected to game server');
        }

        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.send({
            type: 'join_game',
            playerId,
            roomId
        });

        return playerId;
    }

    makeMove(index) {
        if (!this.isConnected) {
            throw new Error('Not connected to game server');
        }

        this.send({
            type: 'make_move',
            index: parseInt(index)
        });
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('Cannot send message: WebSocket not open');
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'connected':
                console.log('Connected to game server:', message.message);
                break;

            case 'game_joined':
                this.gameState.playerSymbol = message.symbol;
                this.gameState.playerId = message.playerId;
                this.gameState.board = message.board;
                this.gameState.currentPlayer = message.currentPlayer;
                
                this.notifyListeners({
                    type: 'game_joined',
                    playerSymbol: message.symbol,
                    playerId: message.playerId
                });
                break;

            case 'game_state':
                this.gameState.board = message.board;
                this.gameState.currentPlayer = message.currentPlayer;
                this.gameState.gameOver = message.gameOver;
                this.gameState.winner = message.winner;

                this.notifyListeners({
                    type: 'game_update',
                    gameState: { ...this.gameState },
                    lastMove: message.lastMove
                });
                break;

            case 'player_left':
                this.notifyListeners({
                    type: 'player_left',
                    playerId: message.playerId
                });
                break;

            case 'error':
                console.error('Game server error:', message.message);
                this.notifyListeners({
                    type: 'error',
                    message: message.message
                });
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notifyListeners(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in game listener:', error);
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }

    getGameState() {
        return { ...this.gameState };
    }

    isPlayerTurn() {
        return this.gameState.currentPlayer === this.gameState.playerSymbol;
    }
}

export default WebSocketGameService;