// Animation helper utilities to avoid TypeScript errors with Framer Motion

// Type-safe spring transition
export const springTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30
};

// Type-safe ease transition
export const easeTransition = (duration: number, delay: number = 0) => ({
  duration,
  delay,
  ease: "easeInOut" as const
});

// Types for framer-motion
export const safeEase = "easeInOut" as const;
export const safeSpring = "spring" as const;
export const safeBefore = "beforeChildren" as const;
export const safeAfter = "afterChildren" as const;

// Presets
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: safeSpring,
      stiffness: 300,
      damping: 25
    }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: safeEase
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: safeSpring,
      stiffness: 300,
      damping: 25
    }
  }
};

// Create type-safe staggered animations
export const createStaggeredVariants = (delayIncrement: number = 0.1) => {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * delayIncrement,
        duration: 0.8,
        ease: safeEase
      }
    })
  };
};
