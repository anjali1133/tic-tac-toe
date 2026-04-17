import { useState, useEffect, useCallback } from 'react';
import nakamaService, { OP_CODES } from '../services/nakama';

const GAME_STATES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    FINDING_MATCH: 'finding_match',
    IN_MATCH: 'in_match',
    GAME_IN_PROGRESS: 'game_in_progress',
    GAME_FINISHED: 'game_finished'
};

export const useGame = () => {
    // Connection state
    const [gameState, setGameState] = useState(GAME_STATES.DISCONNECTED);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // User state
    const [username, setUsername] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    
    // Game state
    const [board, setBoard] = useState(Array(9).fill(null));
    const [players, setPlayers] = useState({});
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [gameResult, setGameResult] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [winningPattern, setWinningPattern] = useState(null);
    const [gameMessage, setGameMessage] = useState('');
    const [gameStatus, setGameStatus] = useState('waiting');
    
    // Timer state
    const [moveTimeLeft, setMoveTimeLeft] = useState(30);
    const [timerInterval, setTimerInterval] = useState(null);
    
    // Start move timer
    const startMoveTimer = useCallback(() => {
        setTimerInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            
            setMoveTimeLeft(30);
            const interval = setInterval(() => {
                setMoveTimeLeft(time => {
                    if (time <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
            
            return interval;
        });
    }, []);

    // Handle timer update
    const handleTimerUpdate = useCallback((data) => {
        setMoveTimeLeft(data.turnTimeLeft || 30);
        setCurrentPlayer(data.currentPlayer || 'X');
    }, []);

    // Handle game update
    const handleGameUpdate = useCallback((data) => {
        console.log('Game update data:', data);
        
        // Update game state based on message type
        switch (data.type) {
            case 'player_joined':
                setPlayers(data.players || {});
                setGameStatus(data.gameStatus || 'waiting');
                setGameMessage('Player joined. Waiting for opponent...');
                break;
                
            case 'game_starting':
                setPlayers(data.players || {});
                setBoard(data.board || Array(9).fill(null));
                setCurrentPlayer(data.currentPlayer || 'X');
                setGameStatus(data.gameStatus || 'starting');
                setGameMessage(data.message || 'Game starting...');
                setGameState(GAME_STATES.IN_MATCH);
                break;
                
            case 'game_started':
                setBoard(data.board || Array(9).fill(null));
                setCurrentPlayer(data.currentPlayer || 'X');
                setGameStatus(data.gameStatus || 'playing');
                setMoveTimeLeft(data.turnTimeLeft || 30);
                setGameMessage('Game started! Make your move.');
                setGameState(GAME_STATES.GAME_IN_PROGRESS);
                startMoveTimer();
                break;
                
            case 'move_made':
                setBoard(data.board || []);
                setCurrentPlayer(data.currentPlayer || 'X');
                setLastMove(data.lastMove !== undefined ? data.lastMove : null);
                setMoveTimeLeft(data.turnTimeLeft || 30);
                
                // Update game message
                const playerList = Object.values(players);
                const currentPlayerObj = playerList.find(p => p.symbol === data.currentPlayer);
                const currentPlayerName = currentPlayerObj ? currentPlayerObj.username : data.currentPlayer;
                setGameMessage(`${currentPlayerName}'s turn (${data.currentPlayer})`);
                
                startMoveTimer();
                break;
                
            case 'player_ready':
                setPlayers(data.players || {});
                setGameMessage(`${data.readyCount || 0}/2 players ready`);
                break;
                
            default:
                console.log('Unknown game update type:', data.type);
        }
    }, [players, startMoveTimer]);

    // Handle game end
    const handleGameEnd = useCallback((data) => {
        console.log('Game end data:', data);
        
        setGameState(GAME_STATES.GAME_FINISHED);
        setBoard(data.board || Array(9).fill(null));
        setWinningPattern(data.winningPattern || null);
        setGameStatus('ended');
        
        // Stop timer
        setTimerInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            return null;
        });
        
        let resultMessage = '';
        let gameResult = null;
        
        if (data.winner === 'draw') {
            resultMessage = 'It\'s a draw!';
            gameResult = { winner: null, isDraw: true };
        } else if (data.winner) {
            // Find winner info
            const playerList = Object.values(players);
            const winnerPlayer = playerList.find(p => p.symbol === data.winner);
            const winnerName = winnerPlayer ? winnerPlayer.username : data.winner;
            
            resultMessage = `${winnerName} wins!`;
            gameResult = { 
                winner: data.winner, 
                winnerName: winnerName,
                winnerUserId: winnerPlayer ? Object.keys(players).find(id => players[id].symbol === data.winner) : null,
                isDraw: false 
            };
        }
        
        // Add reason if provided
        switch (data.reason) {
            case 'timeout':
                resultMessage += ' (Time out!)';
                break;
            case 'opponent_left':
                resultMessage += ' (Opponent left)';
                break;
            case 'draw':
                // Already handled above
                break;
            case 'victory':
                resultMessage += ' 🎉';
                break;
            default:
                if (data.reason) {
                    resultMessage += ` (${data.reason})`;
                }
        }
        
        setGameResult(gameResult);
        setGameMessage(resultMessage);
    }, [players]);

    // Handle match data (game updates)
    const handleMatchData = useCallback((matchData) => {
        const { op_code, data } = matchData;
        
        try {
            const gameData = JSON.parse(data);
            console.log('Game update:', { op_code, gameData });
            
            switch (op_code) {
                case OP_CODES.GAME_UPDATE:
                    handleGameUpdate(gameData);
                    break;
                    
                case OP_CODES.GAME_END:
                    handleGameEnd(gameData);
                    break;
                    
                case OP_CODES.TIMER_UPDATE:
                    handleTimerUpdate(gameData);
                    break;
                    
                default:
                    console.warn('Unknown op code:', op_code);
            }
        } catch (error) {
            console.error('Error parsing match data:', error);
        }
    }, [handleGameUpdate, handleGameEnd, handleTimerUpdate]);

    // Handle match presence changes
    const handleMatchPresence = useCallback((presenceData) => {
        console.log('Match presence update:', presenceData);
        // Handle player joins/leaves through presence
    }, []);

    // Handle matchmaker success
    const handleMatchmakerMatched = useCallback(async (matchData) => {
        console.log('Matchmaker matched:', matchData);
        
        try {
            const match = await nakamaService.joinMatch(matchData.match_id);
            console.log('Joined match:', match);
            setGameState(GAME_STATES.IN_MATCH);
            setGameMessage('Joined match! Waiting for players...');
        } catch (error) {
            console.error('Failed to join match:', error);
            setConnectionError('Failed to join match');
            setGameState(GAME_STATES.CONNECTED);
        }
    }, []);

    // Handle disconnect
    const handleDisconnect = useCallback((event) => {
        console.log('Disconnected from server:', event);
        setIsConnected(false);
        setGameState(GAME_STATES.DISCONNECTED);
        setConnectionError('Disconnected from server');
        
        setTimerInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            return null;
        });
    }, []);

    // Handle error
    const handleError = useCallback((error) => {
        console.error('Nakama error:', error);
        setConnectionError('Connection error occurred');
    }, []);
    
    // Setup event handlers
    useEffect(() => {
        nakamaService.onMatchData = handleMatchData;
        nakamaService.onMatchPresence = handleMatchPresence;
        nakamaService.onMatchmakerMatched = handleMatchmakerMatched;
        nakamaService.onDisconnect = handleDisconnect;
        nakamaService.onError = handleError;
        
        return () => {
            // Cleanup
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [timerInterval, handleMatchData, handleMatchPresence, handleMatchmakerMatched, handleDisconnect, handleError]);

    // Connect to server
    const connect = async (playerUsername) => {
        try {
            setGameState(GAME_STATES.CONNECTING);
            setConnectionError(null);
            setUsername(playerUsername);
            
            // Authenticate
            await nakamaService.authenticate(playerUsername);
            
            // Create socket connection
            await nakamaService.createSocket();
            
            // Update state
            setIsConnected(true);
            setGameState(GAME_STATES.CONNECTED);
            setUserInfo(nakamaService.getUserInfo());
            setGameMessage('Connected! Ready to find a match.');
            
        } catch (error) {
            console.error('Connection failed:', error);
            setConnectionError('Failed to connect to server');
            setGameState(GAME_STATES.DISCONNECTED);
        }
    };

    // Find match
    const findMatch = async () => {
        try {
            setGameState(GAME_STATES.FINDING_MATCH);
            setGameMessage('Looking for an opponent...');
            
            await nakamaService.findMatch();
            
        } catch (error) {
            console.error('Failed to find match:', error);
            setConnectionError('Failed to find match');
            setGameState(GAME_STATES.CONNECTED);
        }
    };

    // Cancel matchmaking
    const cancelMatchmaking = async () => {
        try {
            await nakamaService.cancelMatchmaking();
            setGameState(GAME_STATES.CONNECTED);
            setGameMessage('Matchmaking cancelled');
        } catch (error) {
            console.error('Failed to cancel matchmaking:', error);
        }
    };

    // Make move
    const makeMove = async (position) => {
        if (gameState !== GAME_STATES.GAME_IN_PROGRESS || gameStatus !== 'playing') {
            return false;
        }
        
        if (board[position] !== null) {
            return false;
        }
        
        // Check if it's current user's turn
        if (!isMyTurn()) {
            setGameMessage("It's not your turn!");
            return false;
        }
        
        try {
            await nakamaService.makeMove(position);
            return true;
        } catch (error) {
            console.error('Failed to make move:', error);
            setGameMessage('Failed to make move');
            return false;
        }
    };

    // Leave match
    const leaveMatch = async () => {
        try {
            await nakamaService.leaveMatch();
            setGameState(GAME_STATES.CONNECTED);
            setBoard(Array(9).fill(null));
            setPlayers({});
            setCurrentPlayer('X');
            setGameResult(null);
            setLastMove(null);
            setWinningPattern(null);
            setGameStatus('waiting');
            setGameMessage('Left match');
            
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
        } catch (error) {
            console.error('Failed to leave match:', error);
        }
    };

    // Disconnect
    const disconnect = async () => {
        try {
            await nakamaService.disconnect();
            setIsConnected(false);
            setGameState(GAME_STATES.DISCONNECTED);
            setUserInfo(null);
            setBoard(Array(9).fill(null));
            setPlayers({});
            setCurrentPlayer('X');
            setGameResult(null);
            setLastMove(null);
            setWinningPattern(null);
            setGameStatus('waiting');
            setGameMessage('');
            
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    };

    // Get current player info
    const getCurrentPlayer = () => {
        if (!userInfo || Object.keys(players).length === 0) return null;
        return players[userInfo.userId];
    };

    // Check if it's current user's turn
    const isMyTurn = () => {
        if (!userInfo || Object.keys(players).length < 2 || gameState !== GAME_STATES.GAME_IN_PROGRESS || gameStatus !== 'playing') {
            return false;
        }
        
        const myPlayer = players[userInfo.userId];
        return myPlayer && myPlayer.symbol === currentPlayer;
    };

    return {
        // State
        gameState,
        isConnected,
        connectionError,
        username,
        userInfo,
        
        // Game state
        board,
        players,
        currentPlayer,
        gameResult,
        lastMove,
        winningPattern,
        gameMessage,
        gameStatus,
        moveTimeLeft,
        
        // Actions
        connect,
        disconnect,
        findMatch,
        cancelMatchmaking,
        makeMove,
        leaveMatch,
        
        // Helpers
        getCurrentPlayer,
        isMyTurn,
        
        // Constants
        GAME_STATES
    };
};