import React, { useState, useEffect } from 'react';
import type {
  GameState,
  Card as CardType,
  PropertyColor,
  WildPropertyCard,
  RentCard,
} from '../types';
import { PROPERTY_SET_SIZES } from '../types';
import { Card } from './Card';
import { PlayerBoard } from './PlayerBoard';
import { Hand } from './Hand';
import { ColorPickerModal } from './ColorPickerModal';
import { WinnerScreen } from './WinnerScreen';

interface GameBoardProps {
  gameState: GameState;
  onDrawCards: (count?: number) => void;
  onPlayCard: (card: CardType, targetColor?: PropertyColor) => void;
  onBankCard: (card: CardType) => void;
  onDiscardCard: (card: CardType) => void;
  onEndTurn: () => void;
  onResetGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onDrawCards,
  onPlayCard,
  onBankCard,
  onDiscardCard,
  onEndTurn,
  onResetGame,
}) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerColors, setColorPickerColors] = useState<PropertyColor[]>([]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const opponents = gameState.players.filter((_, i) => i !== gameState.currentPlayerIndex);

  // Check for winner
  useEffect(() => {
    for (const player of gameState.players) {
      const completeSets = player.properties.filter(
        set => set.properties.length >= PROPERTY_SET_SIZES[set.color]
      ).length;
      if (completeSets >= 3 && gameState.phase !== 'gameOver') {
        // Winner found - the game state should update
      }
    }
  }, [gameState.players, gameState.phase]);

  const handleCardClick = (card: CardType) => {
    if (gameState.phase === 'discard') {
      onDiscardCard(card);
      return;
    }

    if (gameState.phase !== 'play' || gameState.actionsRemaining <= 0) {
      return;
    }

    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      return;
    }

    setSelectedCard(card);
  };

  const handlePlayCard = () => {
    if (!selectedCard) return;

    // For wild cards, show color picker
    if (selectedCard.type === 'wild') {
      const wildCard = selectedCard as WildPropertyCard;
      setColorPickerColors(wildCard.colors);
      setShowColorPicker(true);
      return;
    }

    // For rent cards with multiple colors, show color picker
    if (selectedCard.type === 'rent') {
      const rentCard = selectedCard as RentCard;
      if (!rentCard.isWildRent && rentCard.colors.length > 1) {
        // Check which colors the player has properties for
        const playerColors = currentPlayer.properties.map(set => set.color);
        const matchingColors = rentCard.colors.filter(c => playerColors.includes(c));
        if (matchingColors.length > 0) {
          setColorPickerColors(matchingColors);
          setShowColorPicker(true);
          return;
        }
      } else if (rentCard.isWildRent) {
        // Wild rent - can choose any color player has
        const playerColors = currentPlayer.properties.map(set => set.color);
        if (playerColors.length > 0) {
          setColorPickerColors(playerColors);
          setShowColorPicker(true);
          return;
        }
      }
    }

    onPlayCard(selectedCard);
    setSelectedCard(null);
  };

  const handleBankCard = () => {
    if (!selectedCard) return;

    if (selectedCard.type === 'money' || selectedCard.type === 'action' || selectedCard.type === 'rent') {
      onBankCard(selectedCard);
      setSelectedCard(null);
    }
  };

  const handleColorSelect = (color: PropertyColor) => {
    if (selectedCard) {
      onPlayCard(selectedCard, color);
      setSelectedCard(null);
    }
    setShowColorPicker(false);
  };

  const canBank = selectedCard && (
    selectedCard.type === 'money' ||
    selectedCard.type === 'action' ||
    selectedCard.type === 'rent'
  );

  const canPlay = selectedCard && gameState.phase === 'play' && gameState.actionsRemaining > 0;

  if (gameState.phase === 'gameOver' && gameState.winner) {
    return <WinnerScreen winner={gameState.winner} onPlayAgain={onResetGame} />;
  }

  return (
    <div className="game-container">
      {/* Header */}
      <header className="game-header">
        <div className="game-title">
          Monopoly
          <span>Deal</span>
        </div>
        <div className="game-info">
          <div className="turn-indicator">
            <span>{currentPlayer.avatar}</span>
            <span>{currentPlayer.name}'s Turn</span>
            <div className="actions-remaining">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`action-dot ${i > gameState.actionsRemaining ? 'used' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="deck-info">
            <div className="deck-count">🃏 Deck: {gameState.deck.length}</div>
            <div className="discard-count">🗑️ Discard: {gameState.discardPile.length}</div>
          </div>
        </div>
      </header>

      {/* Message Banner */}
      <div className="message-banner">
        {gameState.message}
      </div>

      {/* Game Board */}
      <div className="game-board">
        {/* Opponents Area */}
        <div className="opponents-area">
          {opponents.map(player => (
            <PlayerBoard
              key={player.id}
              player={player}
              isCurrentPlayer={false}
              isOpponent={true}
            />
          ))}
        </div>

        {/* Center Area - Deck and Current Player */}
        <div className="center-area">
          <div className="deck-area">
            <div
              className="deck"
              onClick={gameState.phase === 'draw' ? () => onDrawCards() : undefined}
              style={{ cursor: gameState.phase === 'draw' ? 'pointer' : 'default' }}
            >
              <span className="deck-label">
                {gameState.phase === 'draw' ? 'Click to Draw' : 'Deck'}
              </span>
              <div className="deck-count-display">{gameState.deck.length} cards</div>
            </div>
            <div className="discard-pile">
              {gameState.discardPile.length > 0 ? (
                <Card card={gameState.discardPile[gameState.discardPile.length - 1]} />
              ) : (
                <span className="discard-label">Discard Pile</span>
              )}
            </div>
          </div>

          {/* Current Player's Board */}
          <div className="current-player-area">
            <PlayerBoard
              player={currentPlayer}
              isCurrentPlayer={true}
            />
          </div>
        </div>

        {/* Hand Area */}
        <div>
          <Hand
            cards={currentPlayer.hand}
            selectedCard={selectedCard}
            onCardClick={handleCardClick}
            disabled={gameState.phase === 'draw'}
          />

          {/* Action Buttons */}
          <div className="action-buttons">
            {gameState.phase === 'draw' && (
              <button className="btn btn-primary" onClick={() => onDrawCards()}>
                📥 Draw 2 Cards
              </button>
            )}

            {gameState.phase === 'play' && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handlePlayCard}
                  disabled={!canPlay}
                >
                  ▶️ Play Card
                </button>
                <button
                  className="btn btn-gold"
                  onClick={handleBankCard}
                  disabled={!canBank}
                >
                  💰 Bank Card
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={onEndTurn}
                >
                  ⏭️ End Turn
                </button>
              </>
            )}

            {gameState.phase === 'discard' && (
              <div style={{ color: '#FFD700' }}>
                Select cards to discard (must have 7 or fewer)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPickerModal
          availableColors={colorPickerColors}
          onSelectColor={handleColorSelect}
          onCancel={() => {
            setShowColorPicker(false);
            setSelectedCard(null);
          }}
          title="Choose Property Color"
        />
      )}
    </div>
  );
};

export default GameBoard;
