import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { gsap } from 'gsap';
import { safeEase } from '../utils/animationHelpers';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const screenshots = [
  {
    id: 1,
    title: 'Morning Alarm',
    description: 'Gentle awakening with increasing intensity',
  },
  {
    id: 2,
    title: 'Voice Affirmations',
    description: 'Record your own motivation',
  },
  {
    id: 3,
    title: 'Meditation Flow',
    description: 'Transition from alarm to calm',
  }
];

const AppDemoSection: React.FC = () => {
  const { animationMode, mousePosition, reduceMotion } = useAnimationContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(containerRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // Colors based on animation mode
  const getColor = () => {
    switch(animationMode) {
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

  // Animation for the frame bobbing
  useEffect(() => {
    if (!reduceMotion && frameRef.current) {
      const floatAnimation = gsap.to(frameRef.current, {
        y: '+=15',
        duration: animationMode === 'chill' ? 3 : animationMode === 'focus' ? 2 : 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      return () => {
        floatAnimation.kill();
      };
    }
  }, [animationMode, reduceMotion]);

  // Canvas animation for the alarm waveform
  useEffect(() => {
    if (canvasRef.current && inView) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animationId: number;
      
      if (!ctx) return;
      
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      const speed = animationMode === 'chill' ? 0.5 : animationMode === 'focus' ? 1 : 1.5;
      let phase = 0;
      
      const draw = () => {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        
        const color = getColor();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        const amplitude = currentIndex === 0 ? 30 : currentIndex === 1 ? 20 : 10;
        const frequency = currentIndex === 0 ? 0.02 : currentIndex === 1 ? 0.05 : 0.03;
        
        for (let x = 0; x < canvas.width; x++) {
          const y = amplitude * Math.sin((x * frequency) + phase) + canvas.height / 2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        phase += 0.05 * speed;
        animationId = requestAnimationFrame(draw);
      };
      
      draw();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationId) cancelAnimationFrame(animationId);
      };
    }
  }, [canvasRef, inView, animationMode, currentIndex]);

  // Animation for section entrance
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Handle frame distortion on click
  const handleFrameClick = () => {
    if (frameRef.current && !isDragging) {
      gsap.to(frameRef.current, {
        scale: 1.05,
        boxShadow: `0 0 30px ${getColor()}`,
        duration: 0.2,
        onComplete: () => {
          gsap.to(frameRef.current, {
            scale: 1,
            boxShadow: `0 0 15px ${getColor()}`,
            duration: 0.5
          });
        }
      });
    }
  };

  // Carousel controls
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if ('touches' in e) {
      setDragStart(e.touches[0].clientX);
    } else {
      setDragStart(e.clientX);
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    let currentX;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.clientX;
    }

    const diff = dragStart - currentX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < screenshots.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsDragging(false);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setIsDragging(false);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Frame distortion effect following mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current || reduceMotion) return;
    
    const { left, top, width, height } = frameRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    gsap.to(frameRef.current, {
      rotateY: x * 5,
      rotateX: -y * 5,
      duration: 0.5,
      ease: 'power1.out'
    });
  };

  const handleMouseLeave = () => {
    if (!frameRef.current) return;
    
    gsap.to(frameRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.5,
      ease: 'power1.out'
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: safeEase,
        staggerChildren: 0.2
      }
    }
  };

  const frameVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: safeEase
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: safeEase
      }
    }
  };

  const dotVariants: Variants = {
    inactive: { scale: 1, opacity: 0.5 },
    active: { 
      scale: 1.3, 
      opacity: 1,
      backgroundColor: getColor()
    }
  };

  return (
    <section id="app-demo" className="relative py-24 md:py-32 overflow-hidden">
      <motion.div 
        className="container mx-auto px-4"
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: safeEase } }
          }}
        >
          <span className="neon-text" style={{ color: getColor() }}>Experience</span> the App
        </motion.h2>

        <motion.div 
          className="max-w-md mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { ease: safeEase } }
          }}
        >
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-gray-800 to-black"
            style={{ 
              boxShadow: `0 0 15px ${getColor()}`,
              transition: "box-shadow 0.5s ease"
            }}
            ref={frameRef}
            onClick={handleFrameClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleDragStart}

            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* App screenshot mockup */}
            <div className="aspect-[9/16] w-full p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={frameVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full rounded-2xl flex flex-col bg-gradient-to-b from-gray-900 to-black overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-xl font-semibold" style={{ color: getColor() }}>
                      {screenshots[currentIndex].title}
                    </h3>
                    <p className="text-sm opacity-70">
                      {screenshots[currentIndex].description}
                    </p>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center p-4">
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-40 rounded-lg"
                    />
                  </div>
                  
                  <div className="p-4 flex justify-between items-center">
                    <div className="text-sm font-medium" style={{ color: getColor() }}>
                      Wake Form v2.0
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-opacity-50" style={{ backgroundColor: `${getColor()}30` }}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getColor() }}></div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Carousel navigation dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {screenshots.map((_, index) => (
              <motion.div
                key={index}
                className="h-3 w-3 rounded-full bg-white bg-opacity-50 cursor-pointer"
                variants={dotVariants}
                animate={currentIndex === index ? "active" : "inactive"}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        
          <motion.p 
            className="text-center mt-8 text-gray-300 max-w-xs mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: safeEase } }
            }}
          >
            Swipe or drag to explore app features. Tap screen to see animation effects.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AppDemoSection;
