import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useAnimationContext } from '../contexts/AnimationContext';
import { gsap } from 'gsap';

const Footer: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();

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
        return '#00C2FF';
    }
  };

  // Canvas wave animation
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Set canvas dimensions
      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      let animationId: number;
      let phase = 0;
      
      // Animation speed based on mode
      const speed = animationMode === 'chill' ? 0.5 : 
                   animationMode === 'focus' ? 1 : 1.5;
      
      // Reduce animation intensity if reduced motion is preferred
      const intensity = reduceMotion ? 0.5 : 1;
      
      const animate = () => {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw multiple wave layers with different parameters
        drawWave(ctx, canvas.width, canvas.height, phase * 0.5, getColor(), 0.3, 2);
        drawWave(ctx, canvas.width, canvas.height, phase * 0.8, getColor(), 0.15, 3);
        drawWave(ctx, canvas.width, canvas.height, phase * 1.2, getColor(), 0.1, 1.5);
        
        phase += 0.03 * speed * intensity;
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
      };
    }
  }, [canvasRef, animationMode, reduceMotion]);
  
  // Draw a single wave
  const drawWave = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    phase: number, 
    color: string,
    opacity: number,
    amplitude: number
  ) => {
    ctx.beginPath();
    
    // Start the wave at the bottom left corner
    ctx.moveTo(0, height);
    
    // Wave parameters
    const frequency = 0.02;
    const waveHeight = height * 0.3 * amplitude;
    
    // Draw the wave across the canvas
    for (let x = 0; x <= width; x++) {
      const y = height - waveHeight * Math.sin(x * frequency + phase) - 5;
      ctx.lineTo(x, y);
    }
    
    // Complete the shape by drawing to the bottom right and back to start
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    // Set the gradient fill
    const gradient = ctx.createLinearGradient(width/2, height - waveHeight, width/2, height);
    gradient.addColorStop(0, `${color}00`);
    gradient.addColorStop(1, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  // Social icon animation
  const handleSocialHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    
    gsap.to(e.currentTarget, {
      y: -8,
      boxShadow: `0 0 20px ${getColor()}`,
      duration: 0.3
    });
  };

  const handleSocialLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    
    gsap.to(e.currentTarget, {
      y: 0,
      boxShadow: `0 0 0 transparent`,
      duration: 0.3
    });
  };

  // Ripple effect on social icon click
  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const icon = e.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(icon.offsetWidth, icon.offsetHeight);
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.position = 'absolute';
    ripple.style.top = `${e.nativeEvent.offsetY - diameter/2}px`;
    ripple.style.left = `${e.nativeEvent.offsetX - diameter/2}px`;
    ripple.style.background = getColor();
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'rippleEffect 0.8s ease-out';
    
    icon.style.position = 'relative';
    icon.style.overflow = 'hidden';
    icon.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode === icon) {
        icon.removeChild(ripple);
      }
    }, 800);
  };

  const socialLinks = [
    { icon: 'twitter', href: '#', label: 'Twitter' },
    { icon: 'instagram', href: '#', label: 'Instagram' },
    { icon: 'facebook', href: '#', label: 'Facebook' },
    { icon: 'youtube', href: '#', label: 'YouTube' },
  ];

  // Social icon SVGs
  const getSocialIcon = (name: string) => {
    switch (name) {
      case 'twitter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        );
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'facebook':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        );
      case 'youtube':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer ref={containerRef} className="relative pt-24 pb-12 overflow-hidden">
      {/* Wave animation */}
      <div className="absolute bottom-0 left-0 w-full h-40 z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ filter: `blur(3px)` }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-2"
            >
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: getColor(),
                  textShadow: `0 0 10px ${getColor()}80`
                }}
              >
                WAKE FORM
              </h3>
              <p className="text-gray-400 mb-6">
                Form your wake, transform your day. The only alarm app that grows with your consciousness and adapts to your energy.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
                    style={{ color: getColor() }}
                    onMouseEnter={handleSocialHover}
                    onMouseLeave={handleSocialLeave}
                    onClick={handleSocialClick}
                  >
                    {getSocialIcon(social.icon)}
                  </a>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 
                className="text-lg font-semibold mb-4"
                style={{ color: getColor() }}
              >
                Features
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Affirmation Voices</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Meditation Tracks</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alarm Reliability</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sleep Patterns</a></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 
                className="text-lg font-semibold mb-4"
                style={{ color: getColor() }}
              >
                Contact
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0 }}
            animate={controls}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} WAKE FORM by LerskyTech. All rights reserved.
            </p>
            <motion.div 
              className="text-sm"
              animate={{
                textShadow: [
                  `0 0 5px ${getColor()}00`,
                  `0 0 8px ${getColor()}40`,
                  `0 0 5px ${getColor()}00`
                ],
                transition: {
                  duration: animationMode === 'chill' ? 4 : animationMode === 'focus' ? 3 : 2,
                  ease: 'easeInOut',
                  repeat: Infinity
                }
              }}
            >
              <span style={{ color: getColor() }}>Form Your Wake, Transform Your Day</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Ripple animation CSS */}
      <style>
        {`
        @keyframes rippleEffect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        `}
      </style>
    </footer>
  );
};

export default Footer;
