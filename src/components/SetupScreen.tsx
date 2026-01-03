import React, { useState } from 'react';

interface SetupScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const addPlayer = () => {
    if (playerNames.length < 5) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const handleStartGame = () => {
    const names = playerNames.map((name, i) =>
      name.trim() || `Player ${i + 1}`
    );
    onStartGame(names);
  };

  const canStart = playerNames.length >= 2;

  return (
    <div className="setup-screen">
      <div className="setup-container">
        <div className="setup-title">
          <h1>Monopoly Deal</h1>
          <p>The Card Game</p>
        </div>

        <div className="player-inputs">
          {playerNames.map((name, index) => (
            <div key={index} className="player-input">
              <div className="player-number">{index + 1}</div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1} name`}
                maxLength={15}
              />
              {playerNames.length > 2 && (
                <button
                  className="remove-player-btn"
                  onClick={() => removePlayer(index)}
                  title="Remove player"
                >
                  −
                </button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < 5 && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button className="add-player-btn" onClick={addPlayer} title="Add player">
              +
            </button>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '5px' }}>
              Add player ({playerNames.length}/5)
            </p>
          </div>
        )}

        <button
          className="btn btn-primary start-game-btn"
          onClick={handleStartGame}
          disabled={!canStart}
        >
          🎲 Start Game
        </button>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--monopoly-gold)', marginBottom: '15px' }}>How to Play</h3>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
            <p>🎯 <strong>Goal:</strong> Be the first to collect 3 complete property sets!</p>
            <p>📥 <strong>Draw:</strong> Draw 2 cards at the start of your turn</p>
            <p>🃏 <strong>Play:</strong> Play up to 3 cards per turn</p>
            <p>💰 <strong>Bank:</strong> Save money and action cards as cash</p>
            <p>🏠 <strong>Build:</strong> Collect properties to complete sets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
