import React, { useState, useEffect } from 'react';
import nakamaService from '../services/nakama';

const Leaderboard = ({ isVisible, onClose }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [playerStats, setPlayerStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isVisible && nakamaService.isConnected()) {
            loadLeaderboard();
            loadPlayerStats();
        }
    }, [isVisible]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await nakamaService.getLeaderboard();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const loadPlayerStats = async () => {
        try {
            const data = await nakamaService.getPlayerStats();
            setPlayerStats(data.stats);
        } catch (error) {
            console.error('Failed to load player stats:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="leaderboard-overlay">
            <div className="leaderboard-modal">
                <div className="leaderboard-header">
                    <h2>🏆 Leaderboard</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {/* Player Stats */}
                {playerStats && (
                    <div className="player-stats">
                        <h3>Your Stats</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{playerStats.wins}</span>
                                <span className="stat-label">Wins</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{playerStats.losses}</span>
                                <span className="stat-label">Losses</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{playerStats.draws}</span>
                                <span className="stat-label">Draws</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">
                                    {playerStats.gamesPlayed > 0 ? 
                                        (playerStats.wins / playerStats.gamesPlayed * 100).toFixed(1) : 0}%
                                </span>
                                <span className="stat-label">Win Rate</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{playerStats.winStreak}</span>
                                <span className="stat-label">Current Streak</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{playerStats.bestWinStreak}</span>
                                <span className="stat-label">Best Streak</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="leaderboard-content">
                    <h3>Top Players</h3>
                    
                    {loading && (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            Loading leaderboard...
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <p>{error}</p>
                            <button className="button button-primary" onClick={loadLeaderboard}>
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="leaderboard-list">
                            {leaderboard.length === 0 ? (
                                <div className="empty-state">
                                    <p>No players on the leaderboard yet.</p>
                                    <p>Play some games to appear here!</p>
                                </div>
                            ) : (
                                leaderboard.map((player, index) => (
                                    <div 
                                        key={player.userId} 
                                        className={`leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`}
                                    >
                                        <div className="rank">
                                            {index + 1}
                                            {index === 0 && <span className="trophy">🥇</span>}
                                            {index === 1 && <span className="trophy">🥈</span>}
                                            {index === 2 && <span className="trophy">🥉</span>}
                                        </div>
                                        <div className="player-name">{player.username}</div>
                                        <div className="player-stats-row">
                                            <span className="wins">{player.wins}W</span>
                                            <span className="losses">{player.losses}L</span>
                                            <span className="draws">{player.draws}D</span>
                                            <span className="win-rate">{player.winRate}%</span>
                                            <span className="streak">🔥{player.winStreak}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="leaderboard-footer">
                    <button className="button button-secondary" onClick={onClose}>
                        Close
                    </button>
                    {!loading && (
                        <button className="button button-primary" onClick={loadLeaderboard}>
                            Refresh
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;