import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type AnimationMode = 'chill' | 'focus' | 'energize';

interface AnimationContextType {
  mode: AnimationMode;
  setMode: (mode: AnimationMode) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
  isReduced: boolean;
  mousePosition: { x: number; y: number };
  updateMousePosition: (x: number, y: number) => void;
  scrollProgress: number;
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const defaultContext: AnimationContextType = {
  mode: 'focus',
  setMode: () => {},
  intensity: 1,
  setIntensity: () => {},
  isReduced: false,
  mousePosition: { x: 0, y: 0 },
  updateMousePosition: () => {},
  scrollProgress: 0,
  audioEnabled: false,
  toggleAudio: () => {},
};

const AnimationContext = createContext<AnimationContextType>(defaultContext);

export const useAnimation = () => useContext(AnimationContext);

interface AnimationContextProviderProps {
  children: React.ReactNode;
}

export const AnimationContextProvider: React.FC<AnimationContextProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<AnimationMode>('focus');
  const [intensity, setIntensity] = useState(1);
  const [isReduced, setIsReduced] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);

    const handleChange = () => {
      setIsReduced(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate random subtle movements for idle animation
  useEffect(() => {
    if (isReduced) return;
    
    // Subtle animation even when idle
    const interval = setInterval(() => {
      const subtleFactor = mode === 'chill' ? 0.2 : mode === 'focus' ? 0.4 : 0.6;
      setIntensity(prev => {
        const randomVariation = (Math.random() * 0.1 - 0.05) * subtleFactor;
        return Math.max(0.5, Math.min(1.5, prev + randomVariation));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [mode, isReduced]);

  // Update mouse position
  const updateMousePosition = useCallback((x: number, y: number) => {
    setMousePosition({ x, y });
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        mode,
        setMode,
        intensity,
        setIntensity,
        isReduced,
        mousePosition,
        updateMousePosition,
        scrollProgress,
        audioEnabled,
        toggleAudio,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
