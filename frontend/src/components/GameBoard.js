import React from 'react';

const GameBoard = ({ 
    board, 
    onCellClick, 
    disabled, 
    winningPattern = null,
    lastMove = null 
}) => {
    const handleCellClick = (index) => {
        if (!disabled && board[index] === null) {
            onCellClick(index);
        }
    };

    const getCellClassName = (index) => {
        let className = 'board-cell';
        
        // Add symbol class
        if (board[index]) {
            className += ` ${board[index].toLowerCase()}`;
        }
        
        // Add winning cell class
        if (winningPattern && winningPattern.includes(index)) {
            className += ' winning';
        }
        
        // Add last move highlight
        if (lastMove === index) {
            className += ' last-move';
        }
        
        return className;
    };

    const isCellDisabled = (index) => {
        return disabled || board[index] !== null;
    };

    return (
        <div className="game-board">
            <div className="board-grid">
                {board.map((cell, index) => (
                    <button
                        key={index}
                        className={getCellClassName(index)}
                        onClick={() => handleCellClick(index)}
                        disabled={isCellDisabled(index)}
                        aria-label={`Cell ${index + 1}${cell ? `, filled with ${cell}` : ', empty'}`}
                    >
                        {cell}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameBoard;