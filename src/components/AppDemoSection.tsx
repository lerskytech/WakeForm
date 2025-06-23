import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { gsap } from 'gsap';
import { safeEase } from '../utils/animationHelpers';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import image assets - using direct import for Vite compatibility
// Static imports ensure proper asset handling during build
import wakeForm1 from '../assets/WakeForm1.png';
import wakeForm2 from '../assets/WakeForm2.png';
import wakeForm3 from '../assets/WakeForm3.png';
import wakeForm4 from '../assets/WakeForm4.png';
import wakeForm5 from '../assets/WakeForm5.png';
import wakeForm6 from '../assets/WakeForm6.png';
import wakeForm7 from '../assets/WakeForm7.png';

// Verify the imports are working
const checkImports = () => {
  console.log('Image imports:', { wakeForm1, wakeForm2, wakeForm3, wakeForm4, wakeForm5, wakeForm6, wakeForm7 });
};

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const screenshots = [
  {
    id: 1,
    title: 'Morning Alarm',
    description: 'Gentle awakening with increasing intensity',
    image: wakeForm1
  },
  {
    id: 2,
    title: 'Voice Affirmations',
    description: 'Record your own motivation',
    image: wakeForm2
  },
  {
    id: 3,
    title: 'Meditation Flow',
    description: 'Transition from alarm to calm',
    image: wakeForm3
  },
  {
    id: 4,
    title: 'Sleep Programming',
    description: 'Subconscious integration',
    image: wakeForm4
  },
  {
    id: 5,
    title: 'Custom Prompts',
    description: 'Design your mental programming',
    image: wakeForm5
  },
  {
    id: 6,
    title: 'Track Progress',
    description: 'Monitor your mental growth',
    image: wakeForm6
  },
  {
    id: 7,
    title: 'Advanced Settings',
    description: 'Tune your experience',
    image: wakeForm7
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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Debug images on component mount
  useEffect(() => {
    // Call the debug function to check image imports
    checkImports();
    setImagesLoaded(true);
    
    // Preload all images to ensure they're in cache
    screenshots.forEach(screenshot => {
      if (screenshot.image) {
        const img = new Image();
        img.src = screenshot.image;
      }
    });
  }, []);

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
                  
                  <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Primary image display with neon glow */}
                    <div className="relative w-full flex justify-center items-center">
                      {/* Neon glow background effect */}
                      <div 
                        className="absolute inset-0 blur-xl opacity-30 z-0" 
                        style={{
                          background: `radial-gradient(circle, ${getColor()} 0%, transparent 70%)`,
                        }}
                      />
                      
                      {/* The actual image with enhanced neon border */}
                      <div className="relative z-10 w-full flex justify-center">
                        <img 
                          src={screenshots[currentIndex].image} 
                          alt={screenshots[currentIndex].title}
                          className={`rounded-lg object-contain max-h-[50vh] ${imagesLoaded ? 'opacity-100' : 'opacity-0'}`}
                          style={{ 
                            transition: 'all 0.5s ease',
                            boxShadow: `0 0 20px ${getColor()}80, inset 0 0 10px ${getColor()}30`,
                            border: `1px solid ${getColor()}60`
                          }}
                          onLoad={() => console.log(`Loaded image: ${screenshots[currentIndex].title}`)}
                          onError={(e) => {
                            console.error(`Failed to load image: ${screenshots[currentIndex].image}`);
                            const imgElement = e.currentTarget as HTMLImageElement;
                            imgElement.style.border = '2px solid red';
                            imgElement.style.padding = '20px';
                            imgElement.style.background = 'rgba(0,0,0,0.2)';
                            imgElement.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23${getColor().replace('#', '')}'%3EImage Error%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      </div>
                      
                      {/* Animated scanner line effect */}
                      {!reduceMotion && (
                        <div 
                          className="absolute z-20 w-full h-[2px] left-0 opacity-60"
                          style={{
                            backgroundColor: getColor(),
                            boxShadow: `0 0 8px 2px ${getColor()}`,
                            animation: 'scanLine 2s infinite linear',
                            top: '0%',
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Canvas wave overlay */}
                    <canvas 
                      ref={canvasRef} 
                      className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
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
