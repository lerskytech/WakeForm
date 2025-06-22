import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, stagger } from 'framer-motion';
import { useAnimation as useGlobalAnimation } from '../contexts/AnimationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC = () => {
  const { mode, intensity, mousePosition, isReduced } = useGlobalAnimation();
  const controls = useAnimation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Letter-by-letter animation for main title
  const titleText = "WAKE FORM";
  const subtitleText = "Form Your Wake, Transform Your Day";

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: { 
        type: "spring", 
        damping: 12,
        stiffness: 100 
      }
    }
  };

  // Subtitle variants
  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 1.5, 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // CTA button variants
  const ctaVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 2, 
        duration: 0.5,
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 25px rgba(0, 194, 255, 0.7)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10 
      }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 0 15px rgba(0, 194, 255, 0.9)",
    }
  };

  // Initialize animations when component mounts
  useEffect(() => {
    controls.start("visible");
    
    // Skip GSAP animations if reduced motion is preferred
    if (isReduced || !sectionRef.current) return;
    
    // Parallax effect on scroll
    const parallaxElements = [textRef.current, subtitleRef.current];
    
    gsap.fromTo(parallaxElements, 
      { y: 0 },
      {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      }
    );
  }, [controls, isReduced]);

  // Dynamic color based on animation mode
  const getModeColors = () => {
    switch (mode) {
      case 'chill':
        return {
          primary: 'text-primary-light',
          shadow: 'shadow-primary-light',
          border: 'border-primary-light',
          glow: 'from-primary-light/20',
        };
      case 'focus':
        return {
          primary: 'text-white',
          shadow: 'shadow-white',
          border: 'border-white',
          glow: 'from-white/20',
        };
      case 'energize':
        return {
          primary: 'text-secondary-light',
          shadow: 'shadow-secondary-light',
          border: 'border-secondary-light',
          glow: 'from-secondary-light/20',
        };
    }
  };

  const colors = getModeColors();

  // Handle mouse movement effects on title
  useEffect(() => {
    if (isReduced || !textRef.current) return;
    
    const handleMouseMove = () => {
      const { x, y } = mousePosition;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Calculate distance from center as a factor
      const distanceX = (x - centerX) / centerX;
      const distanceY = (y - centerY) / centerY;
      
      // Apply subtle rotation and movement based on mouse position
      if (textRef.current) {
        gsap.to(textRef.current, {
          rotationY: distanceX * 5,
          rotationX: -distanceY * 5,
          x: distanceX * 10,
          y: distanceY * 10,
          duration: 1,
          ease: "power2.out"
        });
      }
    };
    
    // Update on mouse position change
    handleMouseMove();
  }, [mousePosition, isReduced]);

  return (
    <section 
      ref={sectionRef}
      className="hero-section relative h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Main Hero Title */}
      <motion.h1 
        ref={textRef}
        className={`text-8xl md:text-9xl font-bold tracking-tight ${colors.primary} neon-text hero-text stagger-text`}
        style={{ 
          textShadow: `0 0 10px ${mode === 'chill' ? '#80E1FF' : mode === 'focus' ? '#FFFFFF' : '#80FFD8'}`,
          filter: `brightness(${1 + intensity * 0.2})`,
          willChange: 'transform'
        }}
        variants={titleVariants}
        initial="hidden"
        animate={controls}
      >
        {titleText.split("").map((letter, index) => (
          <motion.span 
            key={index} 
            variants={letterVariants}
            className={`inline-block ${letter === " " ? "mx-4" : ""}`}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p 
        ref={subtitleRef}
        className="text-xl md:text-2xl mt-6 text-accent-blue font-light tracking-wide"
        variants={subtitleVariants}
        initial="hidden"
        animate={controls}
      >
        {subtitleText}
      </motion.p>
      
      {/* CTA Button */}
      <motion.div 
        ref={ctaRef}
        className="mt-12"
        variants={ctaVariants}
        initial="hidden"
        animate={controls}
        whileHover="hover"
        whileTap="tap"
      >
        <button className={`relative px-8 py-4 overflow-hidden rounded-lg bg-background/30 backdrop-blur-md ${colors.border} border-2 group`}>
          {/* Animated gradient background */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colors.glow} to-transparent opacity-50 
                          group-hover:opacity-75 transition-opacity duration-300 animate-pulse-slow`}>
          </div>
          
          {/* Button text with flicker effect */}
          <span className={`relative font-medium text-lg ${colors.primary} group-hover:animate-flicker tracking-widest`}>
            MAKE AN OFFER
          </span>
          
          {/* Ripple effect on hover (added via JS) */}
          <div className="ripple-container absolute inset-0 pointer-events-none"></div>
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3], 
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 2, 
          ease: "easeInOut", 
          repeat: Infinity,
          repeatDelay: 0.5
        }}
      >
        <svg width="24" height="40" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="22" height="38" rx="11" stroke="white" strokeOpacity="0.5" strokeWidth="2"/>
          <circle 
            className="animate-breathe"
            cx="12" 
            cy="12" 
            r="4" 
            fill={mode === 'chill' ? '#80E1FF' : mode === 'focus' ? '#FFFFFF' : '#80FFD8'} 
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;
