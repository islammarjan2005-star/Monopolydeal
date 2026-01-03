import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  Player,
  Card,
  WildPropertyCard,
  PropertySet,
  PropertyColor,
  ActionCard,
  PendingAction,
} from '../types';
import { PROPERTY_SET_SIZES, PROPERTY_RENT_VALUES } from '../types';
import { createDeck, shuffleDeck } from '../data/cards';

const AVATARS = ['🎩', '🚗', '🐕', '👢', '🚢', '🎸', '🎯', '🎪'];

const createPlayer = (name: string, index: number): Player => ({
  id: uuidv4(),
  name,
  hand: [],
  bank: [],
  properties: [],
  avatar: AVATARS[index % AVATARS.length],
});

const initialGameState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [],
  phase: 'setup',
  actionsRemaining: 3,
  turnCount: 0,
  winner: null,
  pendingAction: null,
  message: 'Welcome to Monopoly Deal!',
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const startGame = useCallback((playerNames: string[]) => {
    if (playerNames.length < 2 || playerNames.length > 5) {
      return;
    }

    let deck = shuffleDeck(createDeck());
    const players: Player[] = playerNames.map((name, index) => createPlayer(name, index));

    // Deal 5 cards to each player
    players.forEach(player => {
      player.hand = deck.slice(0, 5);
      deck = deck.slice(5);
    });

    setGameState({
      ...initialGameState,
      players,
      deck,
      phase: 'draw',
      message: `${players[0].name}'s turn - Draw 2 cards!`,
    });
  }, []);

  const drawCards = useCallback((count: number = 2) => {
    setGameState(prev => {
      if (prev.phase !== 'draw' && prev.phase !== 'play') return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      let deck = [...prev.deck];
      let discardPile = [...prev.discardPile];

      // If deck is empty, shuffle discard pile
      if (deck.length < count) {
        deck = shuffleDeck([...deck, ...discardPile]);
        discardPile = [];
      }

      const drawnCards = deck.slice(0, count);
      deck = deck.slice(count);

      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayerIndex
          ? { ...p, hand: [...p.hand, ...drawnCards] }
          : p
      );

      return {
        ...prev,
        players: updatedPlayers,
        deck,
        discardPile,
        phase: 'play',
        actionsRemaining: prev.phase === 'draw' ? 3 : prev.actionsRemaining,
        message: `${currentPlayer.name} drew ${count} cards. Play up to 3 cards.`,
      };
    });
  }, []);

  const getPropertySetForColor = (player: Player, color: PropertyColor): PropertySet | undefined => {
    return player.properties.find(set => set.color === color);
  };

  const isSetComplete = (set: PropertySet): boolean => {
    return set.properties.length >= PROPERTY_SET_SIZES[set.color];
  };

  const calculateRent = (set: PropertySet): number => {
    const propertyCount = Math.min(set.properties.length, PROPERTY_SET_SIZES[set.color]);
    let rent = PROPERTY_RENT_VALUES[set.color][propertyCount - 1] || 0;

    if (isSetComplete(set)) {
      if (set.house) rent += 3;
      if (set.hotel) rent += 4;
    }

    return rent;
  };

  const playCard = useCallback((card: Card, targetColor?: PropertyColor) => {
    setGameState(prev => {
      if (prev.phase !== 'play' || prev.actionsRemaining <= 0) return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const cardIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
      if (cardIndex === -1) return prev;

      let updatedPlayers = [...prev.players];
      let newPhase: GameState['phase'] = prev.phase;
      let newActionsRemaining = prev.actionsRemaining - 1;
      let newMessage = prev.message;
      let discardPile = [...prev.discardPile];
      let pendingAction: PendingAction | null = null;
      let deck = [...prev.deck];

      // Remove card from hand
      const updatedHand = [...currentPlayer.hand];
      updatedHand.splice(cardIndex, 1);

      switch (card.type) {
        case 'money':
          // Add to bank
          updatedPlayers = prev.players.map((p, i) =>
            i === prev.currentPlayerIndex
              ? { ...p, hand: updatedHand, bank: [...p.bank, card] }
              : p
          );
          newMessage = `${currentPlayer.name} banked $${card.value}M`;
          break;

        case 'property': {
          const color = card.color;
          const existingSet = getPropertySetForColor(currentPlayer, color);

          updatedPlayers = prev.players.map((p, i) => {
            if (i !== prev.currentPlayerIndex) return p;

            let newProperties = [...p.properties];
            if (existingSet) {
              newProperties = newProperties.map(set =>
                set.color === color
                  ? { ...set, properties: [...set.properties, card] }
                  : set
              );
            } else {
              newProperties.push({ color, properties: [card] });
            }

            return { ...p, hand: updatedHand, properties: newProperties };
          });
          newMessage = `${currentPlayer.name} played ${card.name}`;
          break;
        }

        case 'wild': {
          if (!targetColor || !card.colors.includes(targetColor)) {
            return prev;
          }

          const wildCard: WildPropertyCard = { ...card, currentColor: targetColor };
          const existingSet = getPropertySetForColor(currentPlayer, targetColor);

          updatedPlayers = prev.players.map((p, i) => {
            if (i !== prev.currentPlayerIndex) return p;

            let newProperties = [...p.properties];
            if (existingSet) {
              newProperties = newProperties.map(set =>
                set.color === targetColor
                  ? { ...set, properties: [...set.properties, wildCard] }
                  : set
              );
            } else {
              newProperties.push({ color: targetColor, properties: [wildCard] });
            }

            return { ...p, hand: updatedHand, properties: newProperties };
          });
          newMessage = `${currentPlayer.name} played a wild card as ${targetColor}`;
          break;
        }

        case 'action': {
          const actionCard = card as ActionCard;

          switch (actionCard.actionType) {
            case 'passGo':
              // Draw 2 cards immediately
              let cardsToDrawFrom = deck;
              if (cardsToDrawFrom.length < 2) {
                cardsToDrawFrom = shuffleDeck([...cardsToDrawFrom, ...discardPile]);
                discardPile = [];
              }
              const drawnCards = cardsToDrawFrom.slice(0, 2);
              deck = cardsToDrawFrom.slice(2);

              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex
                  ? { ...p, hand: [...updatedHand, ...drawnCards] }
                  : p
              );
              discardPile = [...discardPile, card];
              newMessage = `${currentPlayer.name} passed Go and drew 2 cards!`;
              break;

            case 'itsMyBirthday':
              pendingAction = {
                type: 'itsMyBirthday',
                sourcePlayerId: currentPlayer.id,
                amount: 2,
                card,
                canSayNo: true,
              };
              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex ? { ...p, hand: updatedHand } : p
              );
              discardPile = [...discardPile, card];
              newPhase = 'respond';
              newMessage = `${currentPlayer.name} says "It's My Birthday!" - All players must pay $2M`;
              break;

            case 'debtCollector':
              pendingAction = {
                type: 'debtCollector',
                sourcePlayerId: currentPlayer.id,
                amount: 5,
                card,
                canSayNo: true,
              };
              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex ? { ...p, hand: updatedHand } : p
              );
              discardPile = [...discardPile, card];
              newPhase = 'respond';
              newMessage = `${currentPlayer.name} played Debt Collector - Choose a player to pay $5M`;
              break;

            case 'dealBreaker':
            case 'slyDeal':
            case 'forcedDeal':
              pendingAction = {
                type: actionCard.actionType,
                sourcePlayerId: currentPlayer.id,
                card,
                canSayNo: true,
              };
              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex ? { ...p, hand: updatedHand } : p
              );
              discardPile = [...discardPile, card];
              newPhase = 'respond';
              newMessage = `${currentPlayer.name} played ${actionCard.name}`;
              break;

            case 'house':
            case 'hotel':
              // Add to a complete set (simplified - just bank the value)
              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex
                  ? { ...p, hand: updatedHand, bank: [...p.bank, card] }
                  : p
              );
              newMessage = `${currentPlayer.name} banked ${actionCard.name}`;
              break;

            case 'justSayNo':
            case 'doubleRent':
              // Bank these when played without context
              updatedPlayers = prev.players.map((p, i) =>
                i === prev.currentPlayerIndex
                  ? { ...p, hand: updatedHand, bank: [...p.bank, card] }
                  : p
              );
              newMessage = `${currentPlayer.name} banked ${actionCard.name}`;
              break;
          }
          break;
        }

        case 'rent': {
          pendingAction = {
            type: 'rent',
            sourcePlayerId: currentPlayer.id,
            propertyColor: targetColor,
            card,
            canSayNo: true,
          };
          updatedPlayers = prev.players.map((p, i) =>
            i === prev.currentPlayerIndex ? { ...p, hand: updatedHand } : p
          );
          discardPile = [...discardPile, card];
          newPhase = 'respond';
          newMessage = `${currentPlayer.name} is charging rent!`;
          break;
        }
      }

      // Check if player needs to discard
      const player = updatedPlayers[prev.currentPlayerIndex];
      if (newActionsRemaining === 0 && player.hand.length > 7) {
        newPhase = 'discard';
        newMessage = `${player.name} must discard to 7 cards`;
      } else if (newActionsRemaining === 0 && newPhase !== 'respond') {
        // End turn
        newPhase = 'draw';
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        newMessage = `${updatedPlayers[nextPlayerIndex].name}'s turn - Draw 2 cards!`;
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          deck,
          discardPile,
          phase: newPhase,
          actionsRemaining: 3,
          turnCount: prev.turnCount + 1,
          message: newMessage,
          pendingAction,
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        deck,
        discardPile,
        phase: newPhase,
        actionsRemaining: newActionsRemaining,
        message: newMessage,
        pendingAction,
      };
    });
  }, []);

  const bankCard = useCallback((card: Card) => {
    setGameState(prev => {
      if (prev.phase !== 'play' || prev.actionsRemaining <= 0) return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const cardIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
      if (cardIndex === -1) return prev;

      // Can only bank money, action, and rent cards
      if (card.type !== 'money' && card.type !== 'action' && card.type !== 'rent') {
        return prev;
      }

      const updatedHand = [...currentPlayer.hand];
      updatedHand.splice(cardIndex, 1);

      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayerIndex
          ? { ...p, hand: updatedHand, bank: [...p.bank, card] }
          : p
      );

      const newActionsRemaining = prev.actionsRemaining - 1;
      let newPhase: GameState['phase'] = prev.phase;
      let newMessage = `${currentPlayer.name} banked $${card.value}M`;

      if (newActionsRemaining === 0) {
        const player = updatedPlayers[prev.currentPlayerIndex];
        if (player.hand.length > 7) {
          newPhase = 'discard';
          newMessage = `${player.name} must discard to 7 cards`;
        } else {
          newPhase = 'draw';
          const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          newMessage = `${updatedPlayers[nextPlayerIndex].name}'s turn - Draw 2 cards!`;
          return {
            ...prev,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            phase: newPhase,
            actionsRemaining: 3,
            turnCount: prev.turnCount + 1,
            message: newMessage,
          };
        }
      }

      return {
        ...prev,
        players: updatedPlayers,
        phase: newPhase,
        actionsRemaining: newActionsRemaining,
        message: newMessage,
      };
    });
  }, []);

  const discardCard = useCallback((card: Card) => {
    setGameState(prev => {
      if (prev.phase !== 'discard') return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const cardIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
      if (cardIndex === -1) return prev;

      const updatedHand = [...currentPlayer.hand];
      updatedHand.splice(cardIndex, 1);

      const updatedPlayers = prev.players.map((p, i) =>
        i === prev.currentPlayerIndex ? { ...p, hand: updatedHand } : p
      );

      const player = updatedPlayers[prev.currentPlayerIndex];

      if (player.hand.length <= 7) {
        // Move to next player
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        return {
          ...prev,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          discardPile: [...prev.discardPile, card],
          phase: 'draw',
          actionsRemaining: 3,
          turnCount: prev.turnCount + 1,
          message: `${updatedPlayers[nextPlayerIndex].name}'s turn - Draw 2 cards!`,
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
        discardPile: [...prev.discardPile, card],
        message: `Discard ${player.hand.length - 7} more card(s)`,
      };
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (prev.phase !== 'play') return prev;

      const currentPlayer = prev.players[prev.currentPlayerIndex];

      if (currentPlayer.hand.length > 7) {
        return {
          ...prev,
          phase: 'discard',
          message: `${currentPlayer.name} must discard to 7 cards`,
        };
      }

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        phase: 'draw',
        actionsRemaining: 3,
        turnCount: prev.turnCount + 1,
        message: `${prev.players[nextPlayerIndex].name}'s turn - Draw 2 cards!`,
      };
    });
  }, []);

  const resolveAction = useCallback((response: 'accept' | 'sayNo', _paymentCards?: Card[]) => {
    setGameState(prev => {
      if (!prev.pendingAction) return prev;

      // Handle the response
      let updatedPlayers = [...prev.players];
      let newMessage = prev.message;

      if (response === 'sayNo') {
        newMessage = 'Action was blocked with Just Say No!';
      } else if (prev.pendingAction.type === 'itsMyBirthday' || prev.pendingAction.type === 'debtCollector') {
        // Process payment
        newMessage = 'Payment processed!';
      }

      return {
        ...prev,
        players: updatedPlayers,
        phase: 'play',
        pendingAction: null,
        message: newMessage,
      };
    });
  }, []);

  const cancelAction = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'play',
      pendingAction: null,
      message: `${prev.players[prev.currentPlayerIndex].name}'s turn`,
    }));
  }, []);

  const checkWinCondition = useCallback(() => {
    setGameState(prev => {
      for (const player of prev.players) {
        const completeSets = player.properties.filter(set => isSetComplete(set));
        if (completeSets.length >= 3) {
          return {
            ...prev,
            phase: 'gameOver',
            winner: player,
            message: `🎉 ${player.name} wins with 3 complete sets!`,
          };
        }
      }
      return prev;
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  return {
    gameState,
    startGame,
    drawCards,
    playCard,
    bankCard,
    discardCard,
    endTurn,
    resolveAction,
    cancelAction,
    checkWinCondition,
    resetGame,
    calculateRent,
    isSetComplete,
  };
};
