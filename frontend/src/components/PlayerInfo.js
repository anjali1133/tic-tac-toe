import React from 'react';

const PlayerInfo = ({ 
    players, 
    currentPlayer, 
    userInfo, 
    gameState, 
    gameStatus,
    moveTimeLeft 
}) => {
    const playerList = Object.values(players || {});
    
    if (playerList.length === 0) {
        return (
            <div className="game-info">
                <div className="game-status">Waiting for players...</div>
            </div>
        );
    }

    const isGameInProgress = gameState === 'game_in_progress' && gameStatus === 'playing';
    const currentPlayerObj = playerList.find(p => p.symbol === currentPlayer);

    return (
        <div className="game-info">
            <div className="game-status">
                {isGameInProgress && currentPlayerObj && (
                    <>
                        Current turn: {currentPlayerObj.username} ({currentPlayerObj.symbol})
                        {Object.keys(players).find(id => players[id].symbol === currentPlayer) === userInfo?.userId && (
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}> - Your turn!</span>
                        )}
                    </>
                )}
                {gameStatus === 'starting' && (
                    "Game starting..."
                )}
                {gameStatus === 'waiting' && playerList.length === 2 && (
                    "Game ready to start"
                )}
                {playerList.length === 1 && (
                    "Waiting for opponent..."
                )}
            </div>
            
            {isGameInProgress && moveTimeLeft > 0 && (
                <div className={`timer ${moveTimeLeft <= 10 ? 'warning' : ''} ${moveTimeLeft <= 5 ? 'danger' : ''}`}>
                    Time left: {moveTimeLeft}s
                </div>
            )}
            
            <div className="players-info">
                {playerList.map((player) => {
                    const userId = Object.keys(players).find(id => players[id] === player);
                    return (
                        <div 
                            key={userId} 
                            className={`player-info ${
                                isGameInProgress && player.symbol === currentPlayer ? 'current-turn' : ''
                            }`}
                        >
                            <div className="player-name">
                                {player.username}
                                {userId === userInfo?.userId && (
                                    <span style={{ color: '#667eea' }}> (You)</span>
                                )}
                            </div>
                            <div className={`player-symbol ${player.symbol.toLowerCase()}`}>
                                {player.symbol}
                            </div>
                        </div>
                    );
                })}
                
                {/* Show empty slots for missing players */}
                {playerList.length === 1 && (
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