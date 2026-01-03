import React from 'react';
import type {
  Card as CardType,
  PropertyCard,
  WildPropertyCard,
  MoneyCard,
  ActionCard,
  RentCard,
} from '../types';
import {
  PROPERTY_COLORS_DISPLAY,
  PROPERTY_RENT_VALUES,
  PROPERTY_SET_SIZES,
} from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  faceDown?: boolean;
  mini?: boolean;
  className?: string;
}

const getActionIcon = (actionType: ActionCard['actionType']): string => {
  switch (actionType) {
    case 'dealBreaker': return '💔';
    case 'justSayNo': return '🚫';
    case 'slyDeal': return '🦊';
    case 'forcedDeal': return '🔄';
    case 'debtCollector': return '💰';
    case 'itsMyBirthday': return '🎂';
    case 'passGo': return '➡️';
    case 'house': return '🏠';
    case 'hotel': return '🏨';
    case 'doubleRent': return '✖️2️⃣';
    default: return '⚡';
  }
};

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  selected = false,
  faceDown = false,
  mini = false,
  className = '',
}) => {
  if (faceDown) {
    return (
      <div className={`card face-down ${className}`} onClick={onClick}>
        <div className="card-back-design">
          Monopoly<br />Deal
        </div>
      </div>
    );
  }

  if (mini) {
    return renderMiniCard(card, className, onClick);
  }

  const baseClass = `card ${card.type} ${selected ? 'selected' : ''} ${className}`;

  switch (card.type) {
    case 'property':
      return renderPropertyCard(card as PropertyCard, baseClass, onClick);
    case 'wild':
      return renderWildCard(card as WildPropertyCard, baseClass, onClick);
    case 'money':
      return renderMoneyCard(card as MoneyCard, baseClass, onClick);
    case 'action':
      return renderActionCard(card as ActionCard, baseClass, onClick);
    case 'rent':
      return renderRentCard(card as RentCard, baseClass, onClick);
    default:
      return null;
  }
};

const renderPropertyCard = (card: PropertyCard, className: string, onClick?: () => void) => {
  const rentValues = PROPERTY_RENT_VALUES[card.color];
  const setSize = PROPERTY_SET_SIZES[card.color];

  return (
    <div className={`${className} property`} onClick={onClick}>
      <div className={`card-color-bar ${card.color}`}>
        <span className="card-name">{card.name}</span>
      </div>
      <div className="card-body">
        <div className="rent-values">
          {rentValues.map((rent, i) => (
            <div key={i}>
              {i + 1}/{setSize}: ${rent}M
            </div>
          ))}
        </div>
      </div>
      <div className="card-value">${card.value}M</div>
    </div>
  );
};

const renderWildCard = (card: WildPropertyCard, className: string, onClick?: () => void) => {
  const isMultiColor = card.isMultiColor || card.colors.length > 5;

  return (
    <div className={`${className} wild ${isMultiColor ? 'multi-color' : ''}`} onClick={onClick}>
      <div className="wild-header">
        {isMultiColor ? 'Any Color' : 'Wild Card'}
      </div>
      <div className="wild-colors">
        {isMultiColor ? (
          <div style={{ fontSize: '2rem', textAlign: 'center' }}>🌈</div>
        ) : (
          card.colors.map((color, i) => (
            <div
              key={i}
              className="wild-color-dot"
              style={{ backgroundColor: PROPERTY_COLORS_DISPLAY[color] }}
            />
          ))
        )}
      </div>
      <div className="card-value">${card.value}M</div>
    </div>
  );
};

const renderMoneyCard = (card: MoneyCard, className: string, onClick?: () => void) => {
  return (
    <div className={`${className} money`} onClick={onClick}>
      <div className="money-value">
        <span className="money-symbol">$</span>
        {card.value}
        <span className="money-symbol">M</span>
      </div>
      <div className="money-label">Million</div>
    </div>
  );
};

const renderActionCard = (card: ActionCard, className: string, onClick?: () => void) => {
  return (
    <div className={`${className} action`} onClick={onClick}>
      <div className="action-header">
        <span className="action-title">{card.name}</span>
      </div>
      <div className="action-icon">{getActionIcon(card.actionType)}</div>
      <div className="action-description">{card.description}</div>
      <div className="card-value">${card.value}M</div>
    </div>
  );
};

const renderRentCard = (card: RentCard, className: string, onClick?: () => void) => {
  const isWildRent = card.isWildRent || card.colors.length > 5;

  return (
    <div className={`${className} rent ${isWildRent ? 'wild-rent' : ''}`} onClick={onClick}>
      <div className="rent-header">RENT</div>
      {isWildRent ? (
        <div className="wild-rent-icon">🌈💰</div>
      ) : (
        <div className="rent-colors">
          {card.colors.slice(0, 2).map((color, i) => (
            <div
              key={i}
              className="rent-color-block"
              style={{ backgroundColor: PROPERTY_COLORS_DISPLAY[color] }}
            />
          ))}
        </div>
      )}
      <div className="card-value">${card.value}M</div>
    </div>
  );
};

const renderMiniCard = (card: CardType, className: string, onClick?: () => void) => {
  if (card.type === 'property') {
    const propCard = card as PropertyCard;
    return (
      <div className={`mini-card ${className}`} onClick={onClick}>
        <div
          className="mini-color-bar"
          style={{ backgroundColor: PROPERTY_COLORS_DISPLAY[propCard.color] }}
        />
        <div className="mini-body">
          <span className="mini-value">${propCard.value}M</span>
        </div>
      </div>
    );
  }

  if (card.type === 'wild') {
    const wildCard = card as WildPropertyCard;
    const displayColor = wildCard.currentColor
      ? PROPERTY_COLORS_DISPLAY[wildCard.currentColor]
      : '#3498DB';

    return (
      <div className={`mini-card wild ${className}`} onClick={onClick} style={{ background: displayColor }}>
        <span className="mini-icon">🃏</span>
      </div>
    );
  }

  return (
    <div className={`mini-card ${className}`} onClick={onClick}>
      <div className="mini-body" style={{ height: '100%', borderRadius: '4px' }}>
        <span className="mini-value">${card.value}M</span>
      </div>
    </div>
  );
};

export default Card;
