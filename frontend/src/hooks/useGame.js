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
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [gameResult, setGameResult] = useState(null);
    const [lastMove, setLastMove] = useState(null);
    const [winningLine, setWinningLine] = useState(null);
    const [gameMessage, setGameMessage] = useState('');
    
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

    // Handle player join
    const handlePlayerJoin = useCallback((data) => {
        setPlayers(data.players || []);
        setGameMessage(`${data.player.username} joined as ${data.player.symbol}`);
        
        if (data.gameState === 0) { // WAITING_FOR_PLAYERS
            setGameState(GAME_STATES.IN_MATCH);
        }
    }, []);

    // Handle player leave
    const handlePlayerLeave = useCallback((data) => {
        setPlayers(data.players || []);
        setGameMessage(`${data.leftPlayer.username} left the game`);
    }, []);

    // Handle game error
    const handleGameError = useCallback((data) => {
        console.error('Game error:', data);
        setGameMessage(`Error: ${data.error}`);
    }, []);

    // Handle game start
    const handleGameStart = useCallback((data) => {
        setGameState(GAME_STATES.GAME_IN_PROGRESS);
        setBoard(data.board || Array(9).fill(null));
        setPlayers(data.players || []);
        setCurrentTurn(data.currentTurn || 0);
        setGameMessage(data.message || 'Game started!');
        setGameResult(null);
        setWinningLine(null);
        startMoveTimer();
    }, [startMoveTimer]);

    // Handle game update
    const handleGameUpdate = useCallback((data) => {
        setBoard(data.board || []);
        setCurrentTurn(data.currentTurn || 0);
        setLastMove(data.lastMove || null);
        
        const currentPlayer = data.currentPlayer;
        if (currentPlayer) {
            setGameMessage(`${currentPlayer.username}'s turn (${currentPlayer.symbol})`);
        }
        
        startMoveTimer();
    }, [startMoveTimer]);

    // Handle game end
    const handleGameEnd = useCallback((data) => {
        setGameState(GAME_STATES.GAME_FINISHED);
        setBoard(data.finalBoard || Array(9).fill(null));
        setWinningLine(data.winningLine || null);
        
        setTimerInterval(prev => {
            if (prev) {
                clearInterval(prev);
            }
            return null;
        });
        
        let resultMessage = '';
        if (data.winner) {
            resultMessage = `${data.winnerName || 'Unknown'} wins!`;
            setGameResult({ winner: data.winner, winnerName: data.winnerName });
        } else {
            resultMessage = 'It\'s a draw!';
            setGameResult({ winner: null, winnerName: null });
        }
        
        if (data.reason) {
            resultMessage += ` (${data.reason})`;
        }
        
        setGameMessage(resultMessage);
    }, []);

    // Handle match data (game updates)
    const handleMatchData = useCallback((matchData) => {
        const { op_code, data } = matchData;
        
        try {
            const gameData = JSON.parse(data);
            console.log('Game update:', { op_code, gameData });
            
            switch (op_code) {
                case OP_CODES.PLAYER_JOIN:
                    handlePlayerJoin(gameData);
                    break;
                    
                case OP_CODES.PLAYER_LEAVE:
                    handlePlayerLeave(gameData);
                    break;
                    
                case OP_CODES.GAME_START:
                    handleGameStart(gameData);
                    break;
                    
                case OP_CODES.GAME_UPDATE:
                    handleGameUpdate(gameData);
                    break;
                    
                case OP_CODES.GAME_END:
                    handleGameEnd(gameData);
                    break;
                    
                case OP_CODES.ERROR:
                    handleGameError(gameData);
                    break;
                    
                default:
                    console.warn('Unknown op code:', op_code);
            }
        } catch (error) {
            console.error('Error parsing match data:', error);
        }
    }, [handlePlayerJoin, handlePlayerLeave, handleGameStart, handleGameUpdate, handleGameEnd, handleGameError]);

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
        if (gameState !== GAME_STATES.GAME_IN_PROGRESS) {
            return false;
        }
        
        if (board[position] !== null) {
            return false;
        }
        
        // Check if it's current user's turn
        const currentPlayer = players[currentTurn];
        if (!currentPlayer || currentPlayer.userId !== userInfo?.userId) {
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
            setPlayers([]);
            setCurrentTurn(0);
            setGameResult(null);
            setLastMove(null);
            setWinningLine(null);
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
            setPlayers([]);
            setCurrentTurn(0);
            setGameResult(null);
            setLastMove(null);
            setWinningLine(null);
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
        if (!userInfo || players.length === 0) return null;
        return players.find(p => p.userId === userInfo.userId);
    };

    // Check if it's current user's turn
    const isMyTurn = () => {
        if (!userInfo || players.length < 2 || gameState !== GAME_STATES.GAME_IN_PROGRESS) {
            return false;
        }
        
        const currentPlayer = players[currentTurn];
        return currentPlayer && currentPlayer.userId === userInfo.userId;
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
        currentTurn,
        gameResult,
        lastMove,
        winningLine,
        gameMessage,
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