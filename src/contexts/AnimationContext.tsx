import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type AnimationMode = 'chill' | 'focus' | 'energize';

interface AnimationContextType {
  // Mode settings
  animationMode: AnimationMode;
  setAnimationMode: (mode: AnimationMode) => void;
  mode: AnimationMode; // Alias for backward compatibility
  setMode: (mode: AnimationMode) => void; // Alias for backward compatibility
  
  // Animation intensity
  intensity: number;
  setIntensity: (intensity: number) => void;
  
  // Accessibility
  reduceMotion: boolean;
  isReduced: boolean; // Alias for backward compatibility
  
  // Mouse/touch tracking
  mousePosition: { 
    x: number; 
    y: number;
    relativeX: number;
    relativeY: number;
  };
  setMousePosition: (position: { x: number; y: number; relativeX: number; relativeY: number }) => void;
  updateMousePosition: (x: number, y: number) => void; // Alias for backward compatibility
  
  // Scroll tracking
  scrollProgress: number;
  
  // Audio settings
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const defaultContext: AnimationContextType = {
  // Mode settings
  animationMode: 'focus',
  setAnimationMode: () => {},
  mode: 'focus',
  setMode: () => {},
  
  // Animation intensity
  intensity: 1,
  setIntensity: () => {},
  
  // Accessibility
  reduceMotion: false,
  isReduced: false,
  
  // Mouse tracking
  mousePosition: { x: 0, y: 0, relativeX: 0, relativeY: 0 },
  setMousePosition: () => {},
  updateMousePosition: () => {},
  
  // Scroll tracking
  scrollProgress: 0,
  
  // Audio settings
  audioEnabled: false,
  toggleAudio: () => {},
};

const AnimationContext = createContext<AnimationContextType>(defaultContext);

// Export both hook names for compatibility
export const useAnimation = () => useContext(AnimationContext);
export const useAnimationContext = () => useContext(AnimationContext);

interface AnimationContextProviderProps {
  children: React.ReactNode;
}

export const AnimationContextProvider: React.FC<AnimationContextProviderProps> = ({ children }) => {
  // Mode state with both naming conventions for compatibility
  const [animationMode, setAnimationModeState] = useState<AnimationMode>('focus');
  const [intensity, setIntensity] = useState(1);
  
  // Accessibility states
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Mouse position with extended properties
  const [mousePosition, setMousePositionState] = useState({ 
    x: 0, 
    y: 0,
    relativeX: 0,
    relativeY: 0 
  });
  
  // Other states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = () => {
      setReduceMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize with current position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate random subtle movements for idle animation
  useEffect(() => {
    if (reduceMotion) return;
    
    // Subtle animation even when idle
    const interval = setInterval(() => {
      const subtleFactor = animationMode === 'chill' ? 0.2 : animationMode === 'focus' ? 0.4 : 0.6;
      setIntensity(prev => {
        const randomVariation = (Math.random() * 0.1 - 0.05) * subtleFactor;
        return Math.max(0.5, Math.min(1.5, prev + randomVariation));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [animationMode, reduceMotion]);

  // Set animation mode with compatibility method
  const setAnimationMode = useCallback((mode: AnimationMode) => {
    setAnimationModeState(mode);
  }, []);
  
  // Alias for backward compatibility
  const setMode = useCallback((mode: AnimationMode) => {
    setAnimationModeState(mode);
  }, []);

  // Enhanced mouse position setter
  const setMousePosition = useCallback((position: { 
    x: number; 
    y: number; 
    relativeX: number; 
    relativeY: number 
  }) => {
    setMousePositionState(position);
  }, []);
  
  // Legacy mouse position updater for backward compatibility
  const updateMousePosition = useCallback((x: number, y: number) => {
    setMousePositionState(prev => ({
      ...prev,
      x,
      y,
      relativeX: window.innerWidth > 0 ? x / window.innerWidth : 0,
      relativeY: window.innerHeight > 0 ? y / window.innerHeight : 0
    }));
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        // Provide both naming conventions for compatibility
        animationMode,
        setAnimationMode,
        mode: animationMode,
        setMode,
        
        // Animation intensity
        intensity,
        setIntensity,
        
        // Accessibility settings with both naming conventions
        reduceMotion,
        isReduced: reduceMotion,
        
        // Mouse tracking with enhanced position data
        mousePosition,
        setMousePosition,
        updateMousePosition,
        
        // Other settings
        scrollProgress,
        audioEnabled,
        toggleAudio,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
