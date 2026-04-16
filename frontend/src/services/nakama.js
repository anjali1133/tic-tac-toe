import { Client } from '@heroiclabs/nakama-js';

// Configuration
const PORT = process.env.REACT_APP_NAKAMA_PORT || '7350';
const USE_SSL = process.env.REACT_APP_NAKAMA_USE_SSL === 'true';

// Op codes for match communication
export const OP_CODES = {
    MAKE_MOVE: 1,
    GAME_UPDATE: 2,
    PLAYER_JOIN: 3,
    PLAYER_LEAVE: 4,
    GAME_START: 5,
    GAME_END: 6,
    ERROR: 7
};

class NakamaService {
    constructor() {
        this.client = new Client("defaultkey", process.env.REACT_APP_NAKAMA_HOST, "443", true);
        this.session = null;
        this.socket = null;
        this.currentMatch = null;
        this.matchmakerTicket = null;
        
        // Event handlers
        this.onMatchData = null;
        this.onMatchPresence = null;
        this.onMatchmakerMatched = null;
        this.onDisconnect = null;
        this.onError = null;
    }

    // Authenticate user
    async authenticate(username) {
        try {
            // Create or authenticate user with device ID
            const deviceId = this.getOrCreateDeviceId();
            this.session = await this.client.authenticateDevice(deviceId, true, username);
            console.log('Authenticated as:', this.session.username);
            return this.session;
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }

    // Create WebSocket connection
    async createSocket() {
        try {
            this.socket = this.client.createSocket(USE_SSL, false);
            await this.socket.connect(this.session);
            
            // Set up event listeners
            this.setupSocketEventListeners();
            
            console.log('Socket connected');
            return this.socket;
        } catch (error) {
            console.error('Socket connection failed:', error);
            throw error;
        }
    }

    // Set up socket event listeners
    setupSocketEventListeners() {
        if (!this.socket) return;

        // Handle match data (game state updates)
        this.socket.onmatchdata = (matchData) => {
            console.log('Match data received:', matchData);
            if (this.onMatchData) {
                this.onMatchData(matchData);
            }
        };

        // Handle match presence (players joining/leaving)
        this.socket.onmatchpresence = (matchPresence) => {
            console.log('Match presence update:', matchPresence);
            if (this.onMatchPresence) {
                this.onMatchPresence(matchPresence);
            }
        };

        // Handle matchmaker success
        this.socket.onmatchmakermatched = (matchmakerMatched) => {
            console.log('Matchmaker matched:', matchmakerMatched);
            if (this.onMatchmakerMatched) {
                this.onMatchmakerMatched(matchmakerMatched);
            }
        };

        // Handle disconnection
        this.socket.ondisconnect = (event) => {
            console.log('Socket disconnected:', event);
            if (this.onDisconnect) {
                this.onDisconnect(event);
            }
        };

        // Handle errors
        this.socket.onerror = (event) => {
            console.error('Socket error:', event);
            if (this.onError) {
                this.onError(event);
            }
        };
    }

    // Find or create a match
    async findMatch() {
        try {
            if (!this.socket) {
                throw new Error('Socket not connected');
            }

            // Add to matchmaker
            const query = '*';
            const minCount = 2;
            const maxCount = 2;
            const stringProperties = {};
            const numericProperties = {};
            
            const matchmakerTicket = await this.socket.addMatchmaker(
                query, 
                minCount, 
                maxCount, 
                stringProperties, 
                numericProperties
            );
            
            this.matchmakerTicket = matchmakerTicket;
            console.log('Added to matchmaker:', matchmakerTicket);
            
            return matchmakerTicket;
        } catch (error) {
            console.error('Failed to find match:', error);
            throw error;
        }
    }

    // Join a specific match
    async joinMatch(matchId) {
        try {
            if (!this.socket) {
                throw new Error('Socket not connected');
            }

            const match = await this.socket.joinMatch(matchId);
            this.currentMatch = match;
            console.log('Joined match:', match);
            
            return match;
        } catch (error) {
            console.error('Failed to join match:', error);
            throw error;
        }
    }

    // Leave current match
    async leaveMatch() {
        try {
            if (!this.socket || !this.currentMatch) {
                return;
            }

            await this.socket.leaveMatch(this.currentMatch.match_id);
            this.currentMatch = null;
            console.log('Left match');
        } catch (error) {
            console.error('Failed to leave match:', error);
            throw error;
        }
    }

    // Send match data (make a move)
    async sendMatchData(opCode, data) {
        try {
            if (!this.socket || !this.currentMatch) {
                throw new Error('No active match');
            }

            await this.socket.sendMatchData(
                this.currentMatch.match_id,
                opCode,
                JSON.stringify(data)
            );
            
            console.log('Sent match data:', { opCode, data });
        } catch (error) {
            console.error('Failed to send match data:', error);
            throw error;
        }
    }

    // Make a move in the game
    async makeMove(position) {
        return this.sendMatchData(OP_CODES.MAKE_MOVE, { position });
    }

    // Cancel matchmaking
    async cancelMatchmaking() {
        try {
            if (!this.socket || !this.matchmakerTicket) {
                return;
            }

            await this.socket.removeMatchmaker(this.matchmakerTicket.ticket);
            this.matchmakerTicket = null;
            console.log('Cancelled matchmaking');
        } catch (error) {
            console.error('Failed to cancel matchmaking:', error);
            throw error;
        }
    }

    // Disconnect from server
    async disconnect() {
        try {
            await this.leaveMatch();
            await this.cancelMatchmaking();
            
            if (this.socket) {
                this.socket.disconnect(true);
                this.socket = null;
            }
            
            this.session = null;
            console.log('Disconnected from server');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }

    // Get or create device ID for authentication
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('nakama_device_id');
        if (!deviceId) {
            deviceId = this.generateUUID();
            localStorage.setItem('nakama_device_id', deviceId);
        }
        return deviceId;
    }

    // Generate UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    }

    // Get current user info
    getUserInfo() {
        if (!this.session) return null;
        
        return {
            userId: this.session.user_id,
            username: this.session.username,
            displayName: this.session.display_name
        };
    }

    // Check if connected
    isConnected() {
        return this.socket && this.socket.isConnected;
    }

    // Check if in match
    isInMatch() {
        return this.currentMatch !== null;
    }
}

// Create singleton instance
const nakamaService = new NakamaService();
export default nakamaService;