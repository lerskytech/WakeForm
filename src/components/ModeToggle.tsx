import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';

type Mode = 'chill' | 'focus' | 'energize';

const ModeToggle: React.FC = () => {
  const { animationMode, setAnimationMode } = useAnimationContext();
  const [isOpen, setIsOpen] = useState(false);

  const modeData = {
    chill: {
      icon: '🌙',
      color: '#00C2FF',
      label: 'Chill',
      description: 'Slow, soothing animations'
    },
    focus: {
      icon: '🧠',
      color: '#9200FF',
      label: 'Focus',
      description: 'Balanced, mindful movement'
    },
    energize: {
      icon: '⚡',
      color: '#00FFB2',
      label: 'Energize',
      description: 'Vibrant, dynamic effects'
    }
  };

  const toggleOpen = () => setIsOpen(!isOpen);
  
  const changeMode = (mode: Mode) => {
    setAnimationMode(mode);
    setIsOpen(false);
  };

  const currentMode = modeData[animationMode];

  // Animations with proper TypeScript types for Framer Motion
  const containerVariants = {
    closed: {
      width: '60px',
      height: '60px',
      borderRadius: '30px',
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
        when: "afterChildren" as const
      }
    },
    open: {
      width: '280px',
      height: '280px',
      borderRadius: '24px',
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
        when: "beforeChildren" as const,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20, scale: 0.8 },
    open: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  // Animation function instead of variants for pulse effect
  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: animationMode === 'chill' ? 3 : animationMode === 'focus' ? 2 : 1,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <motion.div
      className="fixed right-6 bottom-6 z-50 flex items-center justify-center"
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={containerVariants}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 0 15px ${currentMode.color}80`,
        border: `2px solid ${currentMode.color}`,
        overflow: 'hidden'
      }}
    >
      {/* Current mode indicator (visible when collapsed) */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            key="collapsed-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={toggleOpen}
          >
            <motion.div
              animate={pulseAnimation.animate}
              className="text-2xl"
              style={{ color: currentMode.color }}
            >
              <span className="text-2xl mr-2">{currentMode.icon}</span>
              <span className="sr-only">{currentMode.label}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded view */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute inset-0 p-4 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex justify-between items-center mb-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-medium" style={{ color: currentMode.color }}>
                Animation Mode
              </h3>
              <button
                onClick={toggleOpen}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${currentMode.color}30` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: currentMode.color }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>

            <div className="flex-1 flex flex-col justify-evenly">
              {(Object.keys(modeData) as Mode[]).map(mode => (
                <motion.button
                  key={mode}
                  className="py-3 px-4 rounded-xl flex items-center justify-between transition-transform hover:scale-105"
                  style={{
                    backgroundColor: `${modeData[mode].color}20`,
                    border: `1px solid ${modeData[mode].color}40`,
                    boxShadow: animationMode === mode ? `0 0 10px ${modeData[mode].color}60` : 'none'
                  }}
                  onClick={() => changeMode(mode)}
                  variants={itemVariants}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{modeData[mode].icon}</span>
                    <div className="text-left">
                      <div className="font-medium" style={{ color: modeData[mode].color }}>
                        {modeData[mode].label}
                      </div>
                      <div className="text-xs text-gray-400">{modeData[mode].description}</div>
                    </div>
                  </div>
                  {animationMode === mode && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: modeData[mode].color }}
                    ></div>
                  )}
                </motion.button>
              ))}
            </div>

            <motion.div className="mt-4 text-xs text-center text-gray-500" variants={itemVariants}>
              Changes affect all animations site-wide
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModeToggle;
