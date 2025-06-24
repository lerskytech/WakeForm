import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeSpring, safeEase, fadeIn } from '../utils/animationHelpers';
import { AnimationMode } from '../types';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC = () => {
  const { animationMode, intensity, mousePosition, reduceMotion } = useAnimationContext();
  const controls = useAnimation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const neuralLinesRef = useRef<HTMLDivElement>(null);
  const glitchRef = useRef<HTMLDivElement>(null);

  // Letter-by-letter animation for main title
  const titleText = "WAKE FORM";
  const subtitleText = "// Program Your Mind, Hack Your Reality";
  const commandLinePrefix = "> run mental.init();";

  const titleVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const letterVariants: Variants = {
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
        type: safeSpring, 
        damping: 12,
        stiffness: 100 
      }
    }
  };

  // Subtitle variants
  const subtitleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 1.5, 
        duration: 0.8,
        ease: safeEase
      }
    }
  };

  // CTA button variants
  const ctaVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 2, 
        duration: 0.5,
        type: safeSpring,
        stiffness: 400,
        damping: 40
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 25px rgba(0, 194, 255, 0.7)",
      transition: { 
        type: safeSpring,
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
    if (reduceMotion || !sectionRef.current) return;
    
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

    // Neural network line animations
    if (neuralLinesRef.current) {
      const lines = neuralLinesRef.current.querySelectorAll('.neural-line');
      
      gsap.fromTo(lines, 
        { width: 0, opacity: 0 },
        {
          width: '100%',
          opacity: 1,
          duration: 1.5,
          stagger: 0.2,
          ease: 'power2.out',
        }
      );
    }

    // Occasional glitch effect animation
    const runGlitch = () => {
      if (glitchRef.current) {
        gsap.to(glitchRef.current, {
          opacity: 1,
          duration: 0.1,
          onComplete: () => {
            gsap.to(glitchRef.current, {
              opacity: 0,
              duration: 0.1
            });
          }
        });
      }
    };

    // Random glitch intervals
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) runGlitch();
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, [controls, reduceMotion]);

  // Dynamic color based on animation mode
  const getModeColors = () => {
    switch (animationMode) {
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
      default:
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
    if (reduceMotion || !textRef.current) return;
    
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
  }, [mousePosition, reduceMotion]);

  return (
    <section 
      ref={sectionRef}
      className="hero-section relative h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#001530]"
      style={{ perspective: '1000px' }}
    >
      {/* Neural network background lines */}
      <div ref={neuralLinesRef} className="absolute inset-0 flex flex-col justify-between py-20 px-10 pointer-events-none overflow-hidden opacity-70">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="neural-line my-1"></div>
        ))}
      </div>

      {/* Glitch overlay effect */}
      <div 
        ref={glitchRef} 
        className="absolute inset-0 bg-[#00C2FF] opacity-0 mix-blend-screen pointer-events-none" 
        style={{ clipPath: 'polygon(0 25%, 100% 0%, 100% 77%, 0% 100%)' }}
      ></div>

      {/* Command line interface element */}
      <div className="absolute top-10 left-10 glass-dark p-3 rounded max-w-md border-l-4" style={{ borderColor: '#00C2FF' }}>
        <p className="text-[#00C2FF] font-mono text-sm">{commandLinePrefix}</p>
        <p className="text-white font-mono text-xs opacity-60 mt-1">// Process initiated. Neural interface online.</p>
      </div>
      {/* Main Hero Title */}
      <motion.h1 
        ref={textRef}
        className={`text-8xl md:text-9xl font-bold tracking-tight ${colors.primary} hero-text stagger-text neon-text breathe`}
        style={{ 
          textShadow: `0 0 15px ${animationMode === 'chill' ? '#80E1FF' : animationMode === 'focus' ? '#FFFFFF' : '#80FFD8'}`,
          filter: `brightness(${1 + intensity * 0.3}) contrast(1.1)`,
          willChange: 'transform',
          fontFamily: 'monospace'
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
        className="text-xl md:text-2xl mt-6 text-accent-blue font-mono tracking-wide neon-text-fast"
        variants={subtitleVariants}
        initial="hidden"
        animate={controls}
      >
        {subtitleText}
      </motion.p>
      
      {/* Digital circuit lines */}
      <div className="w-40 h-20 absolute top-1/2 transform -translate-y-1/2 -left-10 opacity-80 pointer-events-none">
        <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 25 L40 25 L40 10 L70 10 L70 40 L100 40" 
                fill="none" 
                stroke="#00C2FF" 
                strokeWidth="1" 
                className="neon-blue">
            <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      
      <div className="w-40 h-20 absolute top-1/2 transform -translate-y-1/2 -right-10 opacity-80 pointer-events-none">
        <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 25 L60 25 L60 40 L30 40 L30 10 L0 10" 
                fill="none" 
                stroke="#00FFB2" 
                strokeWidth="1" 
                className="neon-green">
            <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      
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
        <button className={`relative px-8 py-4 overflow-hidden rounded-lg glass-dark backdrop-blur-md neon-border group`}>
          {/* Animated gradient background */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colors.glow} to-transparent opacity-50 
                          group-hover:opacity-75 transition-opacity duration-300 animate-pulse-slow`}>
          </div>
          
          {/* Button text with flicker effect */}
          <span className={`relative font-mono text-lg text-[#00C2FF] group-hover:animate-flicker tracking-widest neon-text-fast`}>
            $ EXECUTE program
          </span>
          
          {/* Ripple effect on hover (added via JS) */}
          <div className="ripple-container absolute inset-0 pointer-events-none"></div>
          
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-[#00C2FF] neon-blue"></span>
          <span className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-[#00C2FF] neon-blue"></span>
          <span className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-[#00C2FF] neon-blue"></span>
          <span className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-[#00C2FF] neon-blue"></span>
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
            fill={animationMode === 'chill' ? '#80E1FF' : animationMode === 'focus' ? '#FFFFFF' : '#80FFD8'} 
          />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;
