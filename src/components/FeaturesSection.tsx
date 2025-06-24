import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeSpring, safeEase, fadeIn } from '../utils/animationHelpers';
import { AnimationMode } from '../types';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, index }) => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationControls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for cards
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: safeSpring,
        damping: 25,
        stiffness: 100,
        delay: 0.05 * index
      }
    },
    hover: {
      y: -10,
      transition: {
        type: safeSpring,
        damping: 25,
        stiffness: 200
      }
    }
  };

  // Get colors based on current mode
  const getColors = () => {
    switch (animationMode) {
      case 'chill':
        return {
          primary: '#00C2FF',
          secondary: '#0084B0',
          highlight: '#80E1FF',
          bg: 'rgba(0, 20, 36, 0.5)',
          borderClass: 'blue',
          textClass: 'blue'
        };
      case 'focus':
        return {
          primary: '#FFFFFF',
          secondary: '#E0F7FF',
          highlight: '#FFFFFF',
          bg: 'rgba(0, 37, 72, 0.5)',
          borderClass: 'purple',
          textClass: 'purple'
        };
      case 'energize':
      default:
        return {
          primary: '#00FFB2',
          secondary: '#00B37E',
          highlight: '#80FFD8',
          bg: 'rgba(0, 59, 109, 0.5)',
          borderClass: 'green',
          textClass: 'green'
        };
    }
  };

  // Function to draw animated wave background
  const drawWave = () => {
    if (!waveCanvasRef.current || reduceMotion) return;
    
    const canvas = waveCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const colors = getColors();
    
    // Animation parameters based on feature type
    let waveAmplitude: number, waveFrequency: number, waveSpeed: number;
    
    switch (title) {
      case "Affirmation Voices":
        // More dynamic, voice visualization style
        waveAmplitude = 8;
        waveFrequency = 0.05;
        waveSpeed = 0.01;
        break;
      case "Meditation Tracks":
        // Smoother, gentler waves
        waveAmplitude = 5;
        waveFrequency = 0.02;
        waveSpeed = 0.005;
        break;
      case "Alarm Reliability":
        // Digital, precise pattern
        waveAmplitude = 10;
        waveFrequency = 0.08;
        waveSpeed = 0.015;
        break;
      default:
        waveAmplitude = 6;
        waveFrequency = 0.04;
        waveSpeed = 0.01;
    }
    
    let animationFrame: number;
    let time = 0;
    
    // Create animation loop
    const animate = () => {
      time += waveSpeed;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create wave gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      const colors = getColors();
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.5, colors.highlight);
      gradient.addColorStop(1, colors.secondary);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      
      // Begin path for wave
      ctx.beginPath();
      
      // Draw waves specific to each feature card
      for (let x = 0; x < canvas.width; x++) {
        // Different wave pattern based on feature
        let y: number;
        
        if (title === "Affirmation Voices") {
          // Voice visualization with varying heights
          const variation = Math.sin(time * 2 + x * 0.1) * waveAmplitude;
          y = canvas.height / 2 + Math.sin(x * waveFrequency + time) * waveAmplitude + variation;
        } 
        else if (title === "Meditation Tracks") {
          // Smooth ocean-like waves
          y = canvas.height / 2 + 
              Math.sin(x * waveFrequency + time) * waveAmplitude + 
              Math.sin(x * waveFrequency * 0.5 + time * 1.5) * (waveAmplitude * 0.5);
        }
        else {
          // Digital pattern for alarm
          y = canvas.height / 2 + 
              Math.sin(x * waveFrequency + time) * waveAmplitude * 
              Math.cos(x * waveFrequency * 0.2 + time);
          
          // Add occasional "blips" for alarm feature
          if (title === "Alarm Reliability" && Math.random() > 0.99) {
            y = canvas.height / 2 + (Math.random() - 0.5) * waveAmplitude * 3;
          }
        }
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Continue animation
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up animation on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  };
  
  // Initialize animations
  useEffect(() => {
    // Start wave animation
    const cleanupWave = drawWave();
    
    // Set up hover/scroll animations if not reduced
    if (!reduceMotion && cardRef.current) {
      // Reveal animation on scroll
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom-=100px",
            end: "bottom bottom-=200px",
            toggleActions: "play none none reverse",
            onEnter: () => animationControls.start("visible"),
          }
        }
      );
    } else {
      animationControls.start("visible");
    }

    return () => {
      if (cleanupWave) cleanupWave();
    };
  }, [animationMode, reduceMotion, animationControls, title]);

  // Neural circuit animation on hover
  useEffect(() => {
    if (!cardRef.current || reduceMotion) return;
    
    const colors = getColors();
    
    if (isHovered) {
      // Add pulsating glow when hovered
      gsap.to(cardRef.current, {
        boxShadow: `0 0 20px ${colors.primary}`, 
        duration: 0.5,
        repeat: -1,
        yoyo: true
      });
    } else {
      // Reset card glow
      gsap.killTweensOf(cardRef.current);
      gsap.to(cardRef.current, {
        boxShadow: '0 0 0 rgba(0,0,0,0)', 
        duration: 0.3
      });
    }
  }, [isHovered, reduceMotion]);

  return (
    <motion.div
      ref={cardRef}
      className={`feature-card glass-dark p-6 rounded-xl border-t border-l border-r border-b-2 border-${getColors().borderClass} relative overflow-hidden`}
      variants={cardVariants}
      initial="hidden"
      animate={animationControls}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        filter: isHovered ? `drop-shadow(0 0 8px ${getColors().primary})` : 'none'
      }}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border border-opacity-50"
        style={{ borderColor: getColors().primary, boxShadow: `0 0 15px ${getColors().primary}44` }}
      ></div>

      {/* Corner accents with animated neon glow */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 neon-${animationMode === 'chill' ? 'blue' : animationMode === 'focus' ? 'purple' : 'green'}`}></div>
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 neon-${animationMode === 'chill' ? 'blue' : animationMode === 'focus' ? 'purple' : 'green'}`}></div>
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 neon-${animationMode === 'chill' ? 'blue' : animationMode === 'focus' ? 'purple' : 'green'}`}></div>
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 neon-${animationMode === 'chill' ? 'blue' : animationMode === 'focus' ? 'purple' : 'green'}`}></div>

      {/* Command line style header */}
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full mr-2 neon-${animationMode === 'chill' ? 'blue' : animationMode === 'focus' ? 'purple' : 'green'}`}></div>
        <code className={`text-${getColors().textClass} text-xs font-mono`}>~ $ mind_module.load()</code>
      </div>

      <h3 className={`text-xl font-bold mb-3 text-${getColors().textClass} neon-text-fast font-mono`}>{title}</h3>
      <div className={`w-12 h-1 bg-${getColors().primary} mb-4 neural-line`}></div>
      <p className="text-gray-300 font-mono text-sm">{description}</p>

      {/* Hidden canvas for wave animation */}
      <canvas ref={waveCanvasRef} className="absolute bottom-0 left-0 w-full h-1/4 opacity-50" />
      
      {/* Terminal cursor blinking effect */}
      <div className="absolute bottom-3 right-3">
        <div className={`h-4 w-2 bg-${getColors().primary} animate-blink`}></div>
      </div>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const animationControls = useAnimation();
  
  // Get colors based on current mode
  const getColors = () => {
    switch (animationMode) {
      case 'chill':
        return {
          primary: '#00C2FF',
          secondary: '#E0F7FF',
          highlight: '#80E1FF',
          bg: 'rgba(0, 20, 36, 0.5)',
          borderClass: 'blue',
          textClass: 'blue'
        };
      case 'focus':
        return {
          primary: '#9200FF',
          secondary: '#E0F7FF',
          highlight: '#FFFFFF',
          bg: 'rgba(0, 37, 72, 0.5)',
          borderClass: 'purple',
          textClass: 'purple'
        };
      case 'energize':
      default:
        return {
          primary: '#00FFB2',
          secondary: '#00B37E',
          highlight: '#80FFD8',
          bg: 'rgba(0, 59, 109, 0.5)',
          borderClass: 'green',
          textClass: 'green'
        };
    }
  };

  // Features content
  const features = [
    {
      title: "Affirmation Voices",
      description: "Record personalized affirmations in your own voice or choose from premium AI voices designed to connect directly with your subconscious."
    },
    {
      title: "Meditation Tracks",
      description: "Engineered soundscapes with delta wave frequencies that guide your mind to relaxation and receptivity during wake-up and sleep modes."
    },
    {
      title: "Alarm Reliability",
      description: "Proprietary system ensures your wake-up routine triggers exactly when needed, bypassing system limitations for consistent results."
    }
  ];

  // Section reveal animation
  useEffect(() => {
    if (!sectionRef.current || reduceMotion) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom-=100",
        end: "top center",
        toggleActions: "play none none reverse",
        onEnter: () => animationControls.start("visible")
      }
    });

    // Add neural network line animations
    const neuralLines = document.querySelectorAll('.neural-line');
    if (neuralLines.length > 0) {
      gsap.fromTo(neuralLines, 
        { width: 0, opacity: 0 },
        { 
          width: '100%', 
          opacity: 1, 
          duration: 1.5, 
          stagger: 0.2, 
          ease: "power2.out", 
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center"
          }
        }
      );
    }

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [reduceMotion, animationControls]);

  // Section title animation
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: safeSpring,
        damping: 25,
        stiffness: 100
      }
    }
  };

  // Section subtitle animation
  const subheadingVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: safeSpring,
        damping: 25,
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 lg:px-16 relative">
      {/* Section wave divider top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ d: "M0,120 C320,120 320,0 640,0 C960,0 960,120 1280,120 L1440,120 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,120 C320,120 320,0 640,0 C960,0 960,120 1280,120 L1440,120 L1440,120 L0,120 Z",
                "M0,120 C320,120 320,60 640,60 C960,60 960,120 1280,120 L1440,120 L1440,120 L0,120 Z",
                "M0,120 C320,120 320,0 640,0 C960,0 960,120 1280,120 L1440,120 L1440,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            fill="#002548"
            className="wave-path"
          />
        </svg>
      </div>

      {/* Section title with neon effect */}
      <motion.h2 
        ref={headingRef}
        className="text-4xl md:text-5xl font-bold mb-3 neon-text font-mono breathe"
        variants={headingVariants}
        initial="hidden"
        animate={animationControls}
      >
        // MENTAL PROGRAMMING MODULES
      </motion.h2>

      {/* Neural network line */}
      <div className="neural-line w-40 mx-auto my-4"></div>

      {/* Section subtitle */}
      <motion.p
        ref={subheadingRef} 
        className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto text-center font-mono"
        variants={subheadingVariants}
        initial="hidden"
        animate={animationControls}
      >
        Initialize mind programming sequences with our neural interface technology
      </motion.p>
      
      {/* Command line interface element */}
      <div className="glass-dark p-3 rounded max-w-md mx-auto mb-10 border-l-4 font-mono" style={{ borderColor: animationMode === 'chill' ? '#00C2FF' : animationMode === 'focus' ? '#9200FF' : '#00FFB2' }}>
        <p className="text-[#00C2FF] text-sm">{">"}system.load("programming.modules");</p>
        <p className="text-white text-xs opacity-60 mt-1">// Loading neural interfaces... Complete.</p>
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} index={index} />
        ))}
      </div>
      
      {/* Section wave divider bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ d: "M0,0 C320,0 320,120 640,120 C960,120 960,0 1280,0 L1440,0 L1440,120 L0,120 Z" }}
            animate={{ 
              d: [
                "M0,0 C320,0 320,120 640,120 C960,120 960,0 1280,0 L1440,0 L1440,120 L0,120 Z",
                "M0,0 C320,0 320,60 640,60 C960,60 960,0 1280,0 L1440,0 L1440,120 L0,120 Z",
                "M0,0 C320,0 320,120 640,120 C960,120 960,0 1280,0 L1440,0 L1440,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            fill="#002548"
            className="wave-path"
          />
        </svg>
      </div>
    </section>
  );
};

export default FeaturesSection;
