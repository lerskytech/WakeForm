import React, { useRef, useEffect } from 'react';
import { motion, useAnimation as useFramerAnimation, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeSpring, safeEase } from '../utils/animationHelpers';

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
  const animationControls = useFramerAnimation();

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
          bg: 'rgba(0, 20, 36, 0.5)'
        };
      case 'focus':
        return {
          primary: '#FFFFFF',
          secondary: '#E0F7FF',
          highlight: '#FFFFFF',
          bg: 'rgba(0, 37, 72, 0.5)'
        };
      case 'energize':
      default:
        return {
          primary: '#00FFB2',
          secondary: '#00B37E',
          highlight: '#80FFD8',
          bg: 'rgba(0, 59, 109, 0.5)'
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

  return (
    <motion.div 
      ref={cardRef}
      className="feature-card rounded-xl p-1 backdrop-blur-md relative overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate={animationControls}
      whileHover={reduceMotion ? undefined : "hover"}
      style={{
        background: `linear-gradient(45deg, ${getColors().primary}22, ${getColors().secondary}11)`,
        borderRadius: '16px',
      }}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border border-opacity-50"
        style={{ borderColor: getColors().primary, boxShadow: `0 0 15px ${getColors().primary}44` }}
      ></div>

      {/* Background wave animation */}
      <canvas 
        ref={waveCanvasRef} 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ mixBlendMode: 'screen' }}
      ></canvas>

      {/* Card content */}
      <div className="p-6 z-10 relative h-full flex flex-col items-center justify-center text-center">
        <h3 
          className="text-2xl font-semibold mb-4 tracking-wide animate-pulse-slow"
          style={{ color: getColors().highlight }}
        >
          {title}
        </h3>
        <p className="text-accent-blue opacity-90">
          {description}
        </p>
        
        {/* Feature-specific visualizations */}
        {title === "Affirmation Voices" && (
          <div className="mt-4 relative w-3/4 h-10">
            <div className="absolute inset-0 flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full animate-pulse-slow"
                  style={{
                    height: `${20 + Math.sin(i * 0.9) * 15}px`,
                    backgroundColor: getColors().highlight,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
        
        {title === "Meditation Tracks" && (
          <div className="mt-4 relative w-3/4 h-10">
            <div 
              className="absolute inset-0 animate-breathe" 
              style={{ animationDuration: '8s' }}
            >
              <svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 10 Q 25 0, 50 10 T 100 10"
                  fill="none"
                  stroke={getColors().highlight}
                  strokeWidth="1"
                  className="animate-pulse-slow"
                  style={{ animationDuration: '5s' }}
                />
              </svg>
            </div>
          </div>
        )}
        
        {title === "Alarm Reliability" && (
          <div className="mt-4 relative w-3/4 h-10 flex items-center justify-center">
            <div className="digital-clock font-mono text-lg font-bold" style={{ color: getColors().highlight }}>
              <motion.span
                animate={{
                  opacity: [1, 1, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                07:00
              </motion.span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const sectionRef = useRef<HTMLElement>(null);
  const controls = useFramerAnimation();

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
    
    // Animate section title
    const titleElement = sectionRef.current.querySelector('.section-title');
    
    gsap.fromTo(
      titleElement, 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100",
          end: "top center",
          toggleActions: "play none none reverse",
          onEnter: () => controls.start("visible")
        }
      }
    );
  }, [controls, reduceMotion]);

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

      {/* Section heading */}
      <motion.h2 
        className="section-title text-4xl md:text-5xl font-bold text-center mb-16 neon-text"
        initial={{ opacity: 0, y: 30 }}
        animate={controls}
      >
        Form Your Consciousness
      </motion.h2>

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
