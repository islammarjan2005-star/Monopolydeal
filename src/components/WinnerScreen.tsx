import React from 'react';
import type { Player } from '../types';

interface WinnerScreenProps {
  winner: Player;
  onPlayAgain: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({ winner, onPlayAgain }) => {
  return (
    <div className="winner-screen">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <h1 className="winner-title">WINNER!</h1>
        <p className="winner-name">
          {winner.avatar} {winner.name}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
          Collected 3 complete property sets!
        </p>
        <button className="btn btn-gold" onClick={onPlayAgain}>
          🎲 Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerScreen;
