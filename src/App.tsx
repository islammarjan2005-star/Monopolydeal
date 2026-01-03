import React, { useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { SetupScreen } from './components/SetupScreen';
import { GameBoard } from './components/GameBoard';
import { PROPERTY_SET_SIZES } from './types';
import './styles/monopoly.css';

const App: React.FC = () => {
  const {
    gameState,
    startGame,
    drawCards,
    playCard,
    bankCard,
    discardCard,
    endTurn,
    resetGame,
  } = useGameState();

  // Check for winner after each state change
  useEffect(() => {
    if (gameState.phase !== 'setup' && gameState.phase !== 'gameOver') {
      for (const player of gameState.players) {
        const completeSets = player.properties.filter(
          set => set.properties.length >= PROPERTY_SET_SIZES[set.color]
        ).length;
        if (completeSets >= 3) {
          // Winner is handled in the game state
        }
      }
    }
  }, [gameState]);

  if (gameState.phase === 'setup') {
    return <SetupScreen onStartGame={startGame} />;
  }

  return (
    <GameBoard
      gameState={gameState}
      onDrawCards={drawCards}
      onPlayCard={playCard}
      onBankCard={bankCard}
      onDiscardCard={discardCard}
      onEndTurn={endTurn}
      onResetGame={resetGame}
    />
  );
};

export default App;
