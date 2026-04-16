import React from 'react';

const PlayerInfo = ({ 
    players, 
    currentTurn, 
    userInfo, 
    gameState, 
    moveTimeLeft 
}) => {
    if (!players || players.length === 0) {
        return (
            <div className="game-info">
                <div className="game-status">Waiting for players...</div>
            </div>
        );
    }

    const isGameInProgress = gameState === 'game_in_progress';
    const currentPlayer = players[currentTurn];

    return (
        <div className="game-info">
            <div className="game-status">
                {isGameInProgress && currentPlayer && (
                    <>
                        Current turn: {currentPlayer.username} ({currentPlayer.symbol})
                        {currentPlayer.userId === userInfo?.userId && (
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}> - Your turn!</span>
                        )}
                    </>
                )}
                {!isGameInProgress && players.length === 2 && (
                    "Game ready to start"
                )}
                {players.length === 1 && (
                    "Waiting for opponent..."
                )}
            </div>
            
            {isGameInProgress && moveTimeLeft > 0 && (
                <div className={`timer ${moveTimeLeft <= 10 ? 'warning' : ''} ${moveTimeLeft <= 5 ? 'danger' : ''}`}>
                    Time left: {moveTimeLeft}s
                </div>
            )}
            
            <div className="players-info">
                {players.map((player, index) => (
                    <div 
                        key={player.userId} 
                        className={`player-info ${
                            isGameInProgress && index === currentTurn ? 'current-turn' : ''
                        }`}
                    >
                        <div className="player-name">
                            {player.username}
                            {player.userId === userInfo?.userId && (
                                <span style={{ color: '#667eea' }}> (You)</span>
                            )}
                        </div>
                        <div className={`player-symbol ${player.symbol.toLowerCase()}`}>
                            {player.symbol}
                        </div>
                    </div>
                ))}
                
                {/* Show empty slots for missing players */}
                {players.length === 1 && (
                    <div className="player-info">
                        <div className="player-name">Waiting for opponent...</div>
                        <div className="player-symbol">-</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerInfo;