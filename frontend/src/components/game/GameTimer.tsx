import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameTimerProps {
  timeRemaining: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeRemaining }) => {
  const isWarning = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-mono text-lg ${
        isCritical
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : isWarning
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          : 'bg-wood-light text-wood-dark dark:bg-anthracite-700 dark:text-paper-light'
      }`}
      animate={
        isCritical
          ? {
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={{
        duration: 1,
        repeat: isCritical ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span className="font-bold">{formatTime(timeRemaining)}</span>
    </motion.div>
  );
};

export default GameTimer;
