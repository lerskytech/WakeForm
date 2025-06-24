import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView, AnimatePresence, Variants } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeEase } from '../utils/animationHelpers';

// Import image assets directly for Vite compatibility
import wakeForm1 from '../assets/WakeForm1.png';
import wakeForm2 from '../assets/WakeForm2.png';
import wakeForm3 from '../assets/WakeForm3.png';
import wakeForm4 from '../assets/WakeForm4.png';
import wakeForm5 from '../assets/WakeForm5.png';
import wakeForm6 from '../assets/WakeForm6.png';
import wakeForm7 from '../assets/WakeForm7.png';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// App screenshots data
const screenshots = [
  {
    id: 1,
    title: 'Morning Alarm',
    description: 'Gentle awakening with delta waves',
    image: wakeForm1
  },
  {
    id: 2,
    title: 'Voice Affirmations',
    description: 'Program your mind with your own voice',
    image: wakeForm2
  },
  {
    id: 3,
    title: 'Meditation Flow',
    description: 'Guided neural programming sessions',
    image: wakeForm3
  },
  {
    id: 4,
    title: 'Sleep Programming',
    description: 'Subconscious integration during rest',
    image: wakeForm4
  },
  {
    id: 5,
    title: 'Custom Prompts',
    description: 'Design mental programming commands',
    image: wakeForm5
  },
  {
    id: 6,
    title: 'Track Progress',
    description: 'Monitor your neural optimization',
    image: wakeForm6
  },
  {
    id: 7,
    title: 'Advanced Settings',
    description: 'Fine-tune your mind interface',
    image: wakeForm7
  }
];

const AppDemoSection: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const inView = useInView(containerRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Debug image loading
  useEffect(() => {
    console.log('Image imports loaded:', { 
      wakeForm1, wakeForm2, wakeForm3, 
      wakeForm4, wakeForm5, wakeForm6, wakeForm7 
    });
    
    // Preload images to ensure they're cached
    const preloadImages = async () => {
      try {
        const imagePromises = screenshots.map((screenshot) => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              console.log(`Preloaded: ${screenshot.title}`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load: ${screenshot.title}`);
              reject();
            };
            img.src = screenshot.image;
          });
        });
        
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (err) {
        console.error('Image preloading error:', err);
      }
    };
    
    preloadImages();
  }, []);
  
  // Animation trigger based on scroll position
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  // Get color based on animation mode
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
  
  // Time-based animation updates
  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      
      timeRef.current += delta * (animationMode === 'energize' ? 1.5 : 
                                 animationMode === 'focus' ? 1 : 0.7);
      
      if (canvasRef.current) {
        drawCanvas();
      }
      
      frameId = requestAnimationFrame(animate);
    };
    
    if (!reduceMotion) {
      frameId = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [animationMode, reduceMotion]);
  
  // Canvas drawing for digital wave effect
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas is sized correctly
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const time = timeRef.current;
    const color = getColor();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Draw digital waveform
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += 10) {
      const progress = x / canvas.width;
      const amplitude = 5 + Math.sin(time * 0.5) * 3;
      const frequency = 30 + Math.cos(time * 0.3) * 10;
      
      const y = canvas.height * 0.5 + 
        Math.sin(progress * frequency + time) * amplitude * 
        Math.sin(progress * 2 + time * 0.5) * 3;
        
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };
  
  // Frame bobbing animation
  useEffect(() => {
    if (!reduceMotion && frameRef.current) {
      const floatAnimation = gsap.to(frameRef.current, {
        y: '+=15',
        duration: animationMode === 'chill' ? 3 : 
                  animationMode === 'focus' ? 2 : 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      return () => {
        floatAnimation.kill();
      };
    }
  }, [animationMode, reduceMotion]);
  
  // Animation variants
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
    }
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        ease: safeEase
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: safeEase
      }
    }
  };

  const dotVariants: Variants = {
    inactive: { 
      scale: 1, 
      opacity: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    },
    active: { 
      scale: 1.3, 
      opacity: 1,
      backgroundColor: getColor(),
      boxShadow: `0 0 5px 1px ${getColor()}`,
      transition: {
        duration: 0.3,
        ease: safeEase
      }
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
          <span className="inline-block" style={{ color: getColor() }}>
            Mind
          </span>{' '}
          <span className="inline-block">
            Programming
          </span>{' '}
          <span className="inline-block">
            Interface
          </span>
        </motion.h2>
        
        <motion.div 
          className="max-w-4xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, ease: safeEase } }
          }}
        >
          <div 
            ref={frameRef}
            className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-gray-900 to-black"
            style={{ 
              boxShadow: `0 0 30px ${getColor()}40, 0 0 15px ${getColor()}30`
            }}
          >
            {/* Terminal-style header */}
            <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-center flex-grow font-mono text-xs font-medium">
                wake-form@user:~$ <span style={{ color: getColor() }}>view {screenshots[currentIndex].title.toLowerCase().replace(' ', '-')}.exe</span>
              </div>
            </div>
            
            {/* Content area */}
            <div className="flex flex-col md:flex-row">
              {/* Left side - description */}
              <div className="p-5 md:p-8 md:w-1/3 flex flex-col justify-between border-r border-gray-800">
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: getColor() }}>
                    {screenshots[currentIndex].title}
                  </h3>
                  <p className="text-gray-400 mb-4 font-mono text-sm">
                    <span className="text-gray-500">// </span>
                    {screenshots[currentIndex].description}
                  </p>
                  <div className="font-mono text-xs text-gray-500 mt-4">
                    <div>neural_map.load("brainwave_delta")</div>
                    <div>frequency = <span style={{ color: getColor() }}>34.7</span></div>
                    <div>amplitude = <span style={{ color: getColor() }}>0.88</span></div>
                  </div>
                </div>
                
                <div className="hidden md:block text-xs text-gray-500 mt-6 font-mono">
                  <div>System: WakeForm OS v2.0</div>
                  <div>Process: <span style={{ color: getColor() }}>{currentIndex + 1}</span> of <span style={{ color: getColor() }}>{screenshots.length}</span></div>
                </div>
              </div>
              
              {/* Right side - image display */}
              <div className="relative flex-1 flex items-center justify-center p-4 bg-black overflow-hidden">
                {/* Background glow effect */}
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{ 
                    background: `radial-gradient(circle at center, ${getColor()}30 0%, transparent 70%)` 
                  }}
                />
                
                {/* Image display with border glow */}
                <div className="relative z-10 w-full flex justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`image-${currentIndex}`}
                      className="relative rounded-lg overflow-hidden"
                      variants={imageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        boxShadow: `0 0 20px ${getColor()}40`,
                        border: `1px solid ${getColor()}`
                      }}
                    >
                      <img 
                        src={screenshots[currentIndex].image} 
                        alt={screenshots[currentIndex].title}
                        className="max-w-full max-h-[50vh] object-contain"
                        style={{
                          filter: `drop-shadow(0 0 5px ${getColor()}30)`
                        }}
                        onLoad={() => console.log(`Loaded image: ${screenshots[currentIndex].title}`)}
                        onError={(e) => {
                          console.error(`Failed to load image: ${screenshots[currentIndex].image}`);
                          const imgElement = e.currentTarget as HTMLImageElement;
                          imgElement.style.border = '2px solid red';
                          imgElement.style.padding = '20px';
                          imgElement.style.background = 'rgba(0,0,0,0.4)';
                        }}
                      />
                      
                      {/* Scan line effect */}
                      {!reduceMotion && (
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: `repeating-linear-gradient(
                            transparent,
                            transparent 2px,
                            rgba(0, 0, 0, 0.05) 3px,
                            rgba(0, 0, 0, 0.05) 3px
                          )`
                        }} />
                      )}
                      
                      {/* Moving scanner line */}
                      {!reduceMotion && (
                        <div 
                          className="absolute left-0 right-0 h-[2px] z-10"
                          style={{
                            background: getColor(),
                            boxShadow: `0 0 8px ${getColor()}`,
                            animation: 'scanLine 2s linear infinite',
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Canvas overlay for wave effect */}
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                />
              </div>
            </div>
            
            {/* Terminal-style footer with navigation */}
            <div className="bg-gray-900 border-t border-gray-800 px-4 py-3">
              <div className="flex justify-between items-center">
                <button 
                  className="px-3 py-1 rounded bg-gray-800 text-xs font-mono hover:bg-gray-700 transition-colors"
                  onClick={() => setCurrentIndex(prev => prev === 0 ? screenshots.length - 1 : prev - 1)}
                >
                  <span style={{ color: getColor() }}>←</span> prev
                </button>
                
                <div className="flex space-x-2">
                  {screenshots.map((_, index) => (
                    <motion.div
                      key={index}
                      className="h-2 w-2 rounded-full cursor-pointer"
                      variants={dotVariants}
                      animate={currentIndex === index ? "active" : "inactive"}
                      onClick={() => setCurrentIndex(index)}
                      whileHover={{ scale: 1.5 }}
                    />
                  ))}
                </div>
                
                <button 
                  className="px-3 py-1 rounded bg-gray-800 text-xs font-mono hover:bg-gray-700 transition-colors"
                  onClick={() => setCurrentIndex(prev => (prev + 1) % screenshots.length)}
                >
                  next <span style={{ color: getColor() }}>→</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.p 
          className="text-center mt-8 text-gray-400 max-w-md mx-auto font-mono text-xs"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: safeEase } }
          }}
        >
          <span style={{ color: getColor() }}>$</span> Neural programming interface optimized for subconscious integration.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default AppDemoSection;
