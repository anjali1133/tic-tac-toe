import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import GameBoard from './components/GameBoard';
import PlayerInfo from './components/PlayerInfo';
import ConnectionStatus from './components/ConnectionStatus';
import './styles/App.css';

function App() {
    const [usernameInput, setUsernameInput] = useState('');
    
    const {
        // State
        gameState,
        isConnected,
        connectionError,
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
        isMyTurn,
        
        // Constants
        GAME_STATES
    } = useGame();

    const handleConnect = async (e) => {
        e.preventDefault();
        if (usernameInput.trim()) {
            await connect(usernameInput.trim());
        }
    };

    const handleDisconnect = async () => {
        await disconnect();
        setUsernameInput('');
    };

    const handleFindMatch = async () => {
        await findMatch();
    };

    const handleCancelMatchmaking = async () => {
        await cancelMatchmaking();
    };

    const handleLeaveMatch = async () => {
        await leaveMatch();
    };

    const handleCellClick = async (position) => {
        await makeMove(position);
    };

    const handlePlayAgain = async () => {
        await leaveMatch();
        await findMatch();
    };

    // Render login screen
    if (gameState === GAME_STATES.DISCONNECTED) {
        return (
            <div className="app">
                <div className="container fade-in">
                    <div className="header">
                        <h1 className="title">Tic-Tac-Toe</h1>
                        <p className="subtitle">Multiplayer Game</p>
                    </div>
                    
                    <form onSubmit={handleConnect} className="login-form">
                        <div className="input-group">
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your username"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                maxLength={20}
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={!usernameInput.trim()}
                        >
                            {gameState === GAME_STATES.CONNECTING ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Connecting...
                                </>
                            ) : (
                                'Connect & Play'
                            )}
                        </button>
                    </form>
                    
                    {connectionError && (
                        <div className="status-message status-error">
                            {connectionError}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render main game interface
    return (
        <div className="app">
            <div className="container fade-in">
                <div className="header">
                    <h1 className="title">Tic-Tac-Toe</h1>
                    <p className="subtitle">Welcome, {userInfo?.username}!</p>
                </div>
                
                <ConnectionStatus 
                    isConnected={isConnected}
                    gameState={gameState}
                    GAME_STATES={GAME_STATES}
                />
                
                {/* Game Message */}
                {gameMessage && (
                    <div className={`status-message ${
                        connectionError ? 'status-error' : 
                        gameResult ? 'status-success' :
                        gameState === GAME_STATES.FINDING_MATCH ? 'status-waiting' :
                        'status-info'
                    }`}>
                        {gameMessage}
                    </div>
                )}
                
                {/* Connection Error */}
                {connectionError && (
                    <div className="status-message status-error">
                        {connectionError}
                    </div>
                )}
                
                {/* Game Controls - When connected but not in match */}
                {gameState === GAME_STATES.CONNECTED && (
                    <div className="game-controls">
                        <button
                            className="button button-primary"
                            onClick={handleFindMatch}
                        >
                            Find Match
                        </button>
                        
                        <button
                            className="button button-secondary"
                            onClick={handleDisconnect}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
                
                {/* Matchmaking Controls */}
                {gameState === GAME_STATES.FINDING_MATCH && (
                    <div className="game-controls">
                        <button
                            className="button button-secondary"
                            onClick={handleCancelMatchmaking}
                        >
                            Cancel Matchmaking
                        </button>
                        
                        <div className="loading-spinner"></div>
                    </div>
                )}
                
                {/* In Match - Show player info and game board */}
                {(gameState === GAME_STATES.IN_MATCH || 
                  gameState === GAME_STATES.GAME_IN_PROGRESS || 
                  gameState === GAME_STATES.GAME_FINISHED) && (
                    <>
                        <PlayerInfo
                            players={players}
                            currentTurn={currentTurn}
                            userInfo={userInfo}
                            gameState={gameState}
                            moveTimeLeft={moveTimeLeft}
                        />
                        
                        {/* Game Board */}
                        {(gameState === GAME_STATES.GAME_IN_PROGRESS || 
                          gameState === GAME_STATES.GAME_FINISHED) && (
                            <GameBoard
                                board={board}
                                onCellClick={handleCellClick}
                                disabled={!isMyTurn() || gameState === GAME_STATES.GAME_FINISHED}
                                winningLine={winningLine}
                                lastMove={lastMove}
                            />
                        )}
                        
                        {/* Game Controls */}
                        <div className="game-controls">
                            {gameState === GAME_STATES.GAME_FINISHED && (
                                <button
                                    className="button button-primary"
                                    onClick={handlePlayAgain}
                                >
                                    Play Again
                                </button>
                            )}
                            
                            <button
                                className="button button-secondary"
                                onClick={handleLeaveMatch}
                            >
                                Leave Match
                            </button>
                            
                            <button
                                className="button button-secondary"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </button>
                        </div>
                    </>
                )}
                
                {/* Game Result */}
                {gameState === GAME_STATES.GAME_FINISHED && gameResult && (
                    <div className="game-end">
                        <div className="status-message status-success">
                            {gameResult.winner ? (
                                <>
                                    🎉 {gameResult.winnerName} wins!
                                    {gameResult.winner === userInfo?.userId && (
                                        <div>Congratulations! 🎊</div>
                                    )}
                                </>
                            ) : (
                                '🤝 It\'s a draw! Good game!'
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;