import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { useInView } from 'react-intersection-observer';
import gsap from 'gsap';
import { safeSpring, safeEase, fadeIn, fadeInUp } from '../utils/animationHelpers';
import { AnimationMode } from '../types';

interface CtaSectionProps {}

const CtaSection: React.FC<CtaSectionProps> = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });
  const controls = useAnimation();
  const [rippleEnabled, setRippleEnabled] = useState(true);

  // Colors based on animation mode
  const getColor = () => {
    switch (animationMode) {
      case 'chill':
        return '#00C2FF';
      case 'focus':
        return '#9200FF';
      case 'energize':
        return '#00FFB2';
      default:
        return '#9200FF';
    }
  };

  // Handle ripple effect on click
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEnabled || !containerRef.current) return;
    
    const ripple = document.createElement('span');
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.backgroundColor = `${getColor()}80`; // 50% opacity
    
    containerRef.current.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentElement) {
        ripple.parentElement.removeChild(ripple);
      }
    }, 600);
  };

  // Animation effects
  useEffect(() => {
    if (inView && !reduceMotion) {
      controls.start('visible');
      
      // Add pulse animation to the button if in view
      if (buttonRef.current) {
        const animation = buttonRef.current.animate(
          [
            { transform: 'scale(1)', boxShadow: `0 0 0px ${getColor()}60` },
            { transform: 'scale(1.03)', boxShadow: `0 0 30px ${getColor()}80` },
            { transform: 'scale(1)', boxShadow: `0 0 0px ${getColor()}60` }
          ],
          {
            duration: animationMode === 'chill' ? 5000 : 
                     animationMode === 'focus' ? 3500 : 2000,
            iterations: Infinity,
            easing: 'ease-in-out'
          }
        );
        
        return () => animation.cancel();
      }
    } else if (reduceMotion && inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.1 }
      });
    }
  }, [inView, animationMode, reduceMotion, controls]);

  // Gradient background animation
  useEffect(() => {
    if (containerRef.current && inView && !reduceMotion) {
      gsap.to(containerRef.current, {
        backgroundPosition: '200% center',
        duration: animationMode === 'chill' ? 30 : animationMode === 'focus' ? 20 : 15,
        ease: 'linear',
        repeat: -1
      });
    }
  }, [containerRef, inView, animationMode, reduceMotion]);

  // Define animation variants that use our safe animation helpers
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: safeEase
      }
    }
  };

  const staggeredItemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: safeEase
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.4,
        duration: 0.5,
        type: safeSpring,
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: `0 10px 25px ${getColor()}60`,
      transition: {
        duration: 0.2,
        ease: safeEase
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: safeEase
      }
    }
  };

  return (
    <section 
      className="relative py-24 overflow-hidden bg-gray-900"
      id="cta"
      ref={ref}
    >
      {/* Animated gradient background */}
      <div 
        ref={containerRef}
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          background: `linear-gradient(90deg, 
            rgba(0,20,36,1) 0%, 
            ${getColor()}20 50%, 
            rgba(0,20,36,1) 100%)`,
          backgroundSize: '200% 100%',
        }}
      />
      
      {/* Animated particles */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 2,
                height: Math.random() * 8 + 2,
                backgroundColor: getColor(),
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.2
              }}
              animate={{
                y: [0, -Math.random() * 100 - 50],
                opacity: [0.2, 0],
                transition: {
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: safeEase,
                  delay: Math.random() * 2
                }
              }}
            />
          ))}
        </div>
      )}
      
      {/* Content container */}
      <motion.div 
        className="container relative z-10 px-4 mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Heading */}
        <motion.h2 
          className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          variants={itemVariants}
        >
          Ready to transform your mind?
        </motion.h2>
        
        {/* Subheading */}
        <motion.p 
          className="mx-auto mb-10 text-xl text-gray-300 md:text-2xl max-w-3xl"
          variants={itemVariants}
        >
          Join thousands who have unlocked their mental potential with WAKE FORM's revolutionary techniques.
        </motion.p>
        
        {/* CTA Button */}
        <motion.div 
          className="mx-auto"
          variants={itemVariants}
        >
          <motion.button
            ref={buttonRef}
            className="relative px-8 py-4 font-medium text-white rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: getColor(), 
              boxShadow: `0 4px 20px ${getColor()}40`
            }}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleRipple}
          >
            Try it free for 7 days
          </motion.button>
        </motion.div>
        
        {/* Trust badges */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
          variants={itemVariants}
        >
          <span className="text-sm text-gray-500">Trusted by</span>
          {['Brain Research Institute', 'Mindful Tech Labs', 'NeuroPerformance'].map((company, i) => (
            <span key={i} className="text-gray-400">{company}</span>
          ))}
        </motion.div>
      </motion.div>
      
      {/* Ripple animation CSS */}
      <style>
        {`
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: rippleEffect 0.6s linear;
          background-color: rgba(255, 255, 255, 0.3);
          width: 150px;
          height: 150px;
          pointer-events: none;
        }
        
        @keyframes rippleEffect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        `}
      </style>
    </section>
  );
};

export default CtaSection;
