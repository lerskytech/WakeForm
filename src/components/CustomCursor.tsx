import React, { useState, useEffect, useRef } from 'react';
import { useAnimation } from '../contexts/AnimationContext';
import { motion } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const { mode, isReduced } = useAnimation();
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRippleRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isOverButton, setIsOverButton] = useState(false);

  // Skip custom cursor on mobile or reduced motion preference
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }
  
  if (isReduced) {
    return null;
  }

  // Colors based on mode
  const cursorColor = mode === 'chill' ? 'bg-primary-light' :
                     mode === 'focus' ? 'bg-accent' : 'bg-secondary';

  useEffect(() => {
    // Show cursor only when it moves
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    // Track click events for ripple effect
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    // Hide when cursor leaves the window
    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    // Track interactive elements for cursor style changes
    const onElementMouseEnter = () => setIsOverButton(true);
    const onElementMouseLeave = () => setIsOverButton(false);

    // Apply event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .interactive');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', onElementMouseEnter);
      el.addEventListener('mouseleave', onElementMouseLeave);
    });

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Clean up
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', onElementMouseEnter);
        el.removeEventListener('mouseleave', onElementMouseLeave);
      });
    };
  }, []);

  // Create ripple effect on click
  useEffect(() => {
    if (clicked && cursorRippleRef.current) {
      const ripple = document.createElement('div');
      ripple.className = `absolute rounded-full ${cursorColor} opacity-30`;
      ripple.style.width = '5px';
      ripple.style.height = '5px';
      ripple.style.left = '50%';
      ripple.style.top = '50%';
      ripple.style.transform = 'translate(-50%, -50%)';
      
      cursorRippleRef.current.appendChild(ripple);
      
      // Animate the ripple
      setTimeout(() => {
        ripple.style.transition = 'all 1s ease-out';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.opacity = '0';
      }, 10);
      
      // Clean up
      setTimeout(() => {
        if (cursorRippleRef.current?.contains(ripple)) {
          cursorRippleRef.current.removeChild(ripple);
        }
      }, 1000);
    }
  }, [clicked, cursorColor]);
  
  // Main cursor variants for framer-motion
  const cursorVariants = {
    default: {
      x: position.x,
      y: position.y,
      height: 24,
      width: 24, 
      backgroundColor: mode === 'chill' ? 'rgba(128, 225, 255, 0.5)' : 
                       mode === 'focus' ? 'rgba(255, 255, 255, 0.5)' : 
                                          'rgba(128, 255, 216, 0.5)'
    },
    button: {
      x: position.x,
      y: position.y,
      height: 36,
      width: 36,
      backgroundColor: mode === 'chill' ? 'rgba(128, 225, 255, 0.7)' : 
                       mode === 'focus' ? 'rgba(255, 255, 255, 0.7)' : 
                                          'rgba(128, 255, 216, 0.7)',
      mixBlendMode: 'overlay' as 'overlay'
    },
    clicked: {
      x: position.x,
      y: position.y,
      height: 18,
      width: 18,
      backgroundColor: mode === 'chill' ? 'rgba(0, 132, 176, 0.9)' : 
                       mode === 'focus' ? 'rgba(224, 247, 255, 0.9)' : 
                                          'rgba(0, 179, 126, 0.9)'
    },
    hidden: {
      x: position.x,
      y: position.y,
      opacity: 0
    }
  };

  // Get the right variant based on state
  const variant = hidden ? 'hidden' : 
                  clicked ? 'clicked' : 
                  isOverButton ? 'button' : 'default';

  return (
    <>
      <motion.div 
        ref={cursorRef}
        className="custom-cursor"
        variants={cursorVariants}
        animate={variant}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div ref={cursorRippleRef} className="w-full h-full relative" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
