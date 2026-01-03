import React from 'react';
import type { Player, PropertySet, Card as CardType } from '../types';
import { PROPERTY_SET_SIZES, PROPERTY_COLORS_DISPLAY } from '../types';
import { Card } from './Card';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isOpponent?: boolean;
  onPropertyClick?: (set: PropertySet, card: CardType) => void;
}

export const PlayerBoard: React.FC<PlayerBoardProps> = ({
  player,
  isCurrentPlayer,
  isOpponent = false,
  onPropertyClick,
}) => {
  const totalBankValue = player.bank.reduce((sum, card) => sum + card.value, 0);
  const completeSets = player.properties.filter(
    set => set.properties.length >= PROPERTY_SET_SIZES[set.color]
  ).length;

  const renderPropertySet = (set: PropertySet) => {
    const setSize = PROPERTY_SET_SIZES[set.color];
    const isComplete = set.properties.length >= setSize;

    return (
      <div
        key={set.color}
        className={`property-set ${isComplete ? 'complete' : ''}`}
      >
        <div className="set-indicator">
          {Array.from({ length: setSize }).map((_, i) => (
            <div
              key={i}
              className={`set-dot ${i < set.properties.length ? 'filled' : ''}`}
              style={{
                backgroundColor: i < set.properties.length ? PROPERTY_COLORS_DISPLAY[set.color] : undefined,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {set.properties.map((card) => (
            <Card
              key={card.id}
              card={card}
              mini
              onClick={onPropertyClick ? () => onPropertyClick(set, card) : undefined}
            />
          ))}
        </div>
        {isComplete && (set.house || set.hotel) && (
          <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
            {set.house && <span style={{ fontSize: '0.8rem' }}>🏠</span>}
            {set.hotel && <span style={{ fontSize: '0.8rem' }}>🏨</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`player-board ${isCurrentPlayer ? 'current' : ''} ${isOpponent ? 'opponent' : ''}`}>
      <div className="player-header">
        <div className="player-name">
          <span className="player-avatar">{player.avatar}</span>
          <span>{player.name}</span>
          {isCurrentPlayer && <span style={{ color: '#FFD700' }}>⭐</span>}
        </div>
        <div className="player-stats">
          <div className="stat">
            🃏 {player.hand.length}
          </div>
          <div className="stat">
            🏆 {completeSets}/3
          </div>
        </div>
      </div>

      <div className="player-properties">
        {player.properties.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', padding: '10px' }}>
            No properties yet
          </div>
        ) : (
          player.properties.map(set => renderPropertySet(set))
        )}
      </div>

      <div className="player-bank">
        {player.bank.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', padding: '5px' }}>
            Bank empty
          </div>
        ) : (
          player.bank.map(card => (
            <div key={card.id} className="bank-card">
              ${card.value}M
            </div>
          ))
        )}
      </div>
      <div className="bank-total">
        💵 Bank: ${totalBankValue}M
      </div>
    </div>
  );
};

export default PlayerBoard;
