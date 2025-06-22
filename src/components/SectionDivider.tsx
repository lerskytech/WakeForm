import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { gsap } from 'gsap';

interface SectionDividerProps {
  type?: 'wave' | 'neural' | 'zigzag';
  inverted?: boolean;
  className?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ 
  type = 'wave', 
  inverted = false,
  className = '' 
}) => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const dividerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Get the primary color based on animation mode
  const getPrimaryColor = () => {
    switch (animationMode) {
      case 'chill':
        return '#00C2FF';
      case 'focus':
        return '#9200FF';
      case 'energize':
        return '#00FFB2';
      default:
        return '#00C2FF';
    }
  };

  // Secondary color with opacity
  const getSecondaryColor = () => {
    return `${getPrimaryColor()}33`; // 20% opacity
  };

  // Animation effects for the divider
  useEffect(() => {
    if (svgRef.current && !reduceMotion) {
      const paths = svgRef.current.querySelectorAll('path');
      const particles = svgRef.current.querySelectorAll('.particle');
      
      // Different animation speeds based on mode
      const duration = animationMode === 'chill' 
        ? 10 
        : animationMode === 'focus' 
          ? 8 
          : 6;
          
      // Animation for wave paths
      paths.forEach((path, index) => {
        gsap.to(path, {
          morphSVG: `M0,${inverted ? 0 : 100} C${30 + (index * 10)},${inverted ? 30 : 70} ${70 - (index * 10)},${inverted ? 70 : 30} 100,${inverted ? 0 : 100}`,
          yoyo: true,
          repeat: -1,
          duration: duration + (index * 0.5),
          ease: "sine.inOut",
          delay: index * 0.3
        });
      });
      
      // Animation for particles
      particles.forEach((particle, index) => {
        const delay = index * 0.4;
        const initialX = Math.random() * 100;
        
        // Create a timeline for more complex animation with keyframes
        const tl = gsap.timeline({
          repeat: -1,
          delay
        });
        
        // Initial state
        gsap.set(particle, {
          opacity: 0,
          x: initialX,
          y: inverted ? 100 : 0
        });
        
        // Animate with individual tweens instead of arrays
        tl.to(particle, {
          opacity: 0.8,
          duration: (Math.random() * 1.5) + 1,
          ease: "power1.in"
        })
        .to(particle, {
          x: initialX + (Math.random() * 20 - 10),
          y: inverted ? 0 : 100,
          duration: (Math.random() * 2) + 1,
          ease: "power1.inOut"
        }, "<")
        .to(particle, {
          opacity: 0,
          duration: (Math.random() * 1.5) + 1,
          ease: "power1.out"
        }, ">-1");
      });
    }
  }, [animationMode, reduceMotion, inverted]);

  // Create particles for the neural type
  const renderNeuralParticles = () => {
    if (type !== 'neural') return null;
    
    const particles = [];
    const count = 15;
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 2;
      particles.push(
        <circle
          key={i}
          className="particle"
          r={size}
          cx={Math.random() * 100}
          cy={inverted ? 100 : 0}
          fill={getPrimaryColor()}
          opacity="0"
        />
      );
    }
    
    return particles;
  };

  // Render different SVG paths based on the divider type
  const renderPath = () => {
    if (type === 'wave') {
      return (
        <>
          <path 
            d={`M0,${inverted ? 0 : 100} C30,${inverted ? 30 : 70} 70,${inverted ? 70 : 30} 100,${inverted ? 0 : 100}`} 
            fill="none" 
            stroke={getPrimaryColor()} 
            strokeWidth="1" 
            opacity="0.5" 
          />
          <path 
            d={`M0,${inverted ? 0 : 100} C35,${inverted ? 40 : 60} 65,${inverted ? 60 : 40} 100,${inverted ? 0 : 100}`} 
            fill="none" 
            stroke={getPrimaryColor()} 
            strokeWidth="1.5" 
            opacity="0.7" 
          />
          <path 
            d={`M0,${inverted ? 0 : 100} C40,${inverted ? 50 : 50} 60,${inverted ? 50 : 50} 100,${inverted ? 0 : 100}`} 
            fill={getSecondaryColor()} 
          />
        </>
      );
    } else if (type === 'neural') {
      return (
        <>
          <path 
            d={`M0,${inverted ? 0 : 100} C20,${inverted ? 50 : 50} 40,${inverted ? 30 : 70} 60,${inverted ? 70 : 30}`}
            fill="none" 
            stroke={getPrimaryColor()} 
            strokeWidth="1" 
            opacity="0.5"
          />
          <path 
            d={`M40,${inverted ? 20 : 80} C50,${inverted ? 60 : 40} 70,${inverted ? 40 : 60} 100,${inverted ? 0 : 100}`}
            fill="none" 
            stroke={getPrimaryColor()} 
            strokeWidth="1" 
            opacity="0.5"
          />
          <line 
            x1="0" 
            y1={inverted ? 0 : 100} 
            x2="100" 
            y2={inverted ? 0 : 100} 
            stroke={getPrimaryColor()}
            strokeWidth="0.5"
            strokeDasharray="5,3"
            opacity="0.3"
          />
          {renderNeuralParticles()}
        </>
      );
    } else if (type === 'zigzag') {
      return (
        <path 
          d={`M0,${inverted ? 0 : 100} L20,${inverted ? 30 : 70} L40,${inverted ? 0 : 100} L60,${inverted ? 30 : 70} L80,${inverted ? 0 : 100} L100,${inverted ? 30 : 70}`}
          fill="none" 
          stroke={getPrimaryColor()} 
          strokeWidth="2" 
          strokeLinejoin="round"
        />
      );
    }
  };

  return (
    <motion.div
      ref={dividerRef}
      className={`w-full h-16 relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {renderPath()}
      </svg>
    </motion.div>
  );
};

export default SectionDivider;
