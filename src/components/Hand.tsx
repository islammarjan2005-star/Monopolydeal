import React from 'react';
import type { Card as CardType } from '../types';
import { Card } from './Card';

interface HandProps {
  cards: CardType[];
  selectedCard: CardType | null;
  onCardClick: (card: CardType) => void;
  disabled?: boolean;
}

export const Hand: React.FC<HandProps> = ({
  cards,
  selectedCard,
  onCardClick,
  disabled = false,
}) => {
  return (
    <div className="hand-area">
      <div className="hand-label">
        <span>Your Hand</span>
        <span>{cards.length} cards</span>
      </div>
      <div className="hand-cards">
        {cards.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            No cards in hand
          </div>
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCard?.id === card.id}
              onClick={disabled ? undefined : () => onCardClick(card)}
              className="card-enter"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Hand;
