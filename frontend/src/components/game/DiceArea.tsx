import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useUIStore } from '../../stores/uiStore';
import { soundService } from '../../services/soundService';
import { DiceState, GameTurn } from '../../types';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface DiceAreaProps {
  diceState: DiceState;
  isMyTurn: boolean;
  gameMode: string;
  currentTurn: GameTurn | null;
}

const DiceArea: React.FC<DiceAreaProps> = ({
  diceState,
  isMyTurn,
  gameMode,
  currentTurn,
}) => {
  const { rollDice } = useGameStore();
  const { animationsEnabled } = useUIStore();

  const getDiceIcon = (value: number) => {
    const iconProps = { className: "h-8 w-8" };
    switch (value) {
      case 1: return <Dice1 {...iconProps} />;
      case 2: return <Dice2 {...iconProps} />;
      case 3: return <Dice3 {...iconProps} />;
      case 4: return <Dice4 {...iconProps} />;
      case 5: return <Dice5 {...iconProps} />;
      case 6: return <Dice6 {...iconProps} />;
      default: return <Dice1 {...iconProps} />;
    }
  };

  const handleDiceClick = (index: number) => {
    if (!isMyTurn || diceState.isRolling || diceState.rollNumber === 0) return;

    const newKept = [...diceState.kept];
    newKept[index] = !newKept[index];

    if (gameMode === 'eins_muss_weg' && diceState.rollNumber > 0) {
      const previousKept = currentTurn?.dice_kept || [false, false, false, false, false];
      const hasNewKept = newKept.some((kept, i) => kept && !previousKept[i]);
      
      if (!hasNewKept) {
        return; // Must keep at least one new die
      }
    }

    useGameStore.setState({
      diceState: {
        ...diceState,
        kept: newKept,
      }
    });
  };

  const handleRollDice = () => {
    if (!isMyTurn || diceState.isRolling || diceState.rollNumber >= 3) return;

    soundService.play('diceRoll');
    rollDice(diceState.kept);
  };

  const canRoll = isMyTurn && !diceState.isRolling && diceState.rollNumber < 3;
  const hasRolled = diceState.rollNumber > 0;

  return (
    <div className="paper-texture rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light">
          Würfel
        </h2>
        <div className="text-sm text-wood-medium dark:text-paper-medium">
          Wurf {diceState.rollNumber}/3
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {diceState.values.map((value, index) => (
          <motion.div
            key={index}
            className={`dice-face cursor-pointer transition-all duration-200 ${
              diceState.kept[index] 
                ? 'ring-4 ring-wood-medium bg-wood-light' 
                : 'hover:scale-105'
            } ${
              !isMyTurn || diceState.isRolling || !hasRolled
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            onClick={() => handleDiceClick(index)}
            animate={
              diceState.isRolling && animationsEnabled
                ? {
                    rotateX: [0, 360],
                    rotateY: [0, 180],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            {getDiceIcon(value)}
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleRollDice}
          disabled={!canRoll}
          className={`btn-primary flex items-center space-x-2 mx-auto ${
            !canRoll ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RotateCcw className="h-5 w-5" />
          <span>
            {diceState.rollNumber === 0 ? 'Würfeln' : `Würfeln (${3 - diceState.rollNumber} übrig)`}
          </span>
        </button>

        {gameMode === 'eins_muss_weg' && hasRolled && (
          <p className="mt-2 text-sm text-wood-medium dark:text-paper-medium">
            Mindestens einen Würfel behalten!
          </p>
        )}

        {!isMyTurn && (
          <p className="mt-2 text-sm text-wood-medium dark:text-paper-medium">
            Warten auf anderen Spieler...
          </p>
        )}
      </div>
    </div>
  );
};

export default DiceArea;
