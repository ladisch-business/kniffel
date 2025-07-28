import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GameLogicService } from '../../services/gameLogic';
import { soundService } from '../../services/soundService';
import { Game, GamePlayer } from '../../types';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScorecardProps {
  player: GamePlayer;
  game: Game;
  isMyTurn: boolean;
  diceValues: number[];
}

const Scorecard: React.FC<ScorecardProps> = ({
  player,
  game,
  isMyTurn,
  diceValues,
}) => {
  const { scoreBlocks, submitScore } = useGameStore();
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const playerScoreBlocks = scoreBlocks.get(player.id) || [];
  const currentBlock = playerScoreBlocks[selectedBlock] || {};

  const categories = GameLogicService.getScoreCategories();

  const handleCategoryClick = (categoryKey: string) => {
    if (!isMyTurn || !isCategoryAvailable(categoryKey)) return;

    soundService.play('scoreSubmit');
    submitScore(categoryKey, selectedBlock);
  };

  const isCategoryAvailable = (categoryKey: string) => {
    return currentBlock[categoryKey] === null || currentBlock[categoryKey] === undefined;
  };

  const getScoreForCategory = (categoryKey: string) => {
    const category = categories.find(c => c.key === categoryKey);
    if (!category) return 0;
    return category.calculate(diceValues);
  };

  const getDisplayScore = (categoryKey: string) => {
    if (currentBlock[categoryKey] !== null && currentBlock[categoryKey] !== undefined) {
      return currentBlock[categoryKey];
    }
    
    if (hoveredCategory === categoryKey && isMyTurn) {
      return getScoreForCategory(categoryKey);
    }
    
    return '';
  };

  const upperSum = (currentBlock.ones || 0) + (currentBlock.twos || 0) + 
                  (currentBlock.threes || 0) + (currentBlock.fours || 0) + 
                  (currentBlock.fives || 0) + (currentBlock.sixes || 0);
  
  const upperBonus = upperSum >= 63 ? 35 : 0;
  const upperTotal = upperSum + upperBonus;

  const lowerSum = (currentBlock.three_of_kind || 0) + (currentBlock.four_of_kind || 0) + 
                  (currentBlock.full_house || 0) + (currentBlock.small_straight || 0) + 
                  (currentBlock.large_straight || 0) + (currentBlock.kniffel || 0) + 
                  (currentBlock.chance || 0);

  const jokerBonus = (currentBlock.joker_kniffels || 0) * 100;
  const grandTotal = upperTotal + lowerSum + jokerBonus;

  return (
    <div className="paper-texture rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-wood-dark dark:text-paper-light">
          Spielblock - {player.username}
        </h2>
        
        {game.mode === 'multi_block' && game.multi_blocks > 1 && (
          <div className="flex space-x-1">
            {Array.from({ length: game.multi_blocks }).map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedBlock(index)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedBlock === index
                    ? 'bg-wood-medium text-paper-light'
                    : 'bg-wood-light text-wood-dark hover:bg-wood-medium hover:text-paper-light'
                }`}
              >
                Block {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-wood-medium">
          {/* Upper Section */}
          <thead>
            <tr className="bg-wood-light dark:bg-anthracite-700">
              <th className="scorecard-cell font-bold text-left" colSpan={2}>
                Oberer Bereich
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.filter(c => c.isUpper).map((category) => (
              <motion.tr
                key={category.key}
                className={`${
                  isCategoryAvailable(category.key) && isMyTurn
                    ? 'scorecard-cell available'
                    : ''
                }`}
                whileHover={
                  isCategoryAvailable(category.key) && isMyTurn
                    ? { scale: 1.02 }
                    : {}
                }
              >
                <td className="scorecard-cell font-medium">
                  {category.name}
                </td>
                <td
                  className={`scorecard-cell text-center ${
                    currentBlock[category.key] !== null && currentBlock[category.key] !== undefined
                      ? 'filled'
                      : ''
                  }`}
                  onClick={() => handleCategoryClick(category.key)}
                  onMouseEnter={() => setHoveredCategory(category.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {getDisplayScore(category.key)}
                  {currentBlock[category.key] !== null && currentBlock[category.key] !== undefined && (
                    <Check className="h-4 w-4 inline ml-1 text-green-600" />
                  )}
                </td>
              </motion.tr>
            ))}
            
            <tr className="bg-wood-light dark:bg-anthracite-700">
              <td className="scorecard-cell font-bold">Summe (≥63 → +35)</td>
              <td className="scorecard-cell text-center font-bold">
                {upperSum} {upperBonus > 0 && `+ ${upperBonus}`}
              </td>
            </tr>
            <tr className="bg-wood-medium text-paper-light">
              <td className="scorecard-cell font-bold">Zwischensumme</td>
              <td className="scorecard-cell text-center font-bold">{upperTotal}</td>
            </tr>
          </tbody>

          {/* Lower Section */}
          <thead>
            <tr className="bg-wood-light dark:bg-anthracite-700">
              <th className="scorecard-cell font-bold text-left" colSpan={2}>
                Unterer Bereich
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.filter(c => !c.isUpper).map((category) => (
              <motion.tr
                key={category.key}
                className={`${
                  isCategoryAvailable(category.key) && isMyTurn
                    ? 'scorecard-cell available'
                    : ''
                }`}
                whileHover={
                  isCategoryAvailable(category.key) && isMyTurn
                    ? { scale: 1.02 }
                    : {}
                }
              >
                <td className="scorecard-cell font-medium">
                  {category.name}
                  {category.key === 'kniffel' && (
                    <Star className="h-4 w-4 inline ml-1 text-yellow-500" />
                  )}
                </td>
                <td
                  className={`scorecard-cell text-center ${
                    currentBlock[category.key] !== null && currentBlock[category.key] !== undefined
                      ? 'filled'
                      : ''
                  }`}
                  onClick={() => handleCategoryClick(category.key)}
                  onMouseEnter={() => setHoveredCategory(category.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {getDisplayScore(category.key)}
                  {currentBlock[category.key] !== null && currentBlock[category.key] !== undefined && (
                    <Check className="h-4 w-4 inline ml-1 text-green-600" />
                  )}
                </td>
              </motion.tr>
            ))}

            {game.joker_kniffel && (
              <tr>
                <td className="scorecard-cell font-medium">
                  Joker-Kniffel Bonus
                </td>
                <td className="scorecard-cell text-center">
                  {currentBlock.joker_kniffels || 0} × 100 = {jokerBonus}
                </td>
              </tr>
            )}

            <tr className="bg-wood-medium text-paper-light">
              <td className="scorecard-cell font-bold">Gesamtsumme</td>
              <td className="scorecard-cell text-center font-bold text-lg">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isMyTurn && (
        <div className="mt-4 text-center text-sm text-wood-medium dark:text-paper-medium">
          Klicken Sie auf ein verfügbares Feld, um Ihre Punkte einzutragen
        </div>
      )}
    </div>
  );
};

export default Scorecard;
