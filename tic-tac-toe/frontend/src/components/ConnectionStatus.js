import React from 'react';

const ConnectionStatus = ({ isConnected, gameState, GAME_STATES }) => {
    const getStatusText = () => {
        if (!isConnected) {
            return 'Disconnected';
        }
        
        switch (gameState) {
            case GAME_STATES.CONNECTING:
                return 'Connecting...';
            case GAME_STATES.CONNECTED:
                return 'Connected';
            case GAME_STATES.FINDING_MATCH:
                return 'Finding match...';
            case GAME_STATES.IN_MATCH:
                return 'In match lobby';
            case GAME_STATES.GAME_IN_PROGRESS:
                return 'Game in progress';
            case GAME_STATES.GAME_FINISHED:
                return 'Game finished';
            default:
                return 'Unknown status';
        }
    };

    const getStatusClass = () => {
        if (!isConnected || gameState === GAME_STATES.DISCONNECTED) {
            return 'disconnected';
        }
        return 'connected';
    };

    return (
        <div className="connection-status">
            <div className={`connection-dot ${getStatusClass()}`}></div>
            <span>{getStatusText()}</span>
        </div>
    );
};

export default ConnectionStatus;