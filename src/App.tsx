import React, { useEffect } from 'react';
import { useAnimation } from './contexts/AnimationContext';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppDemoSection from './components/AppDemoSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import ModeToggle from './components/ModeToggle';

const App: React.FC = () => {
  const { updateMousePosition, mode, isReduced } = useAnimation();

  // Track mouse movement for animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    // Handle device orientation for mobile
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma && e.beta) {
        // Normalize gamma (-90 to 90) and beta (-180 to 180) to window dimensions
        const x = ((e.gamma / 90) * window.innerWidth / 2) + window.innerWidth / 2;
        const y = ((e.beta / 180) * window.innerHeight / 2) + window.innerHeight / 2;
        updateMousePosition(x, y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [updateMousePosition]);

  return (
    <div className={`app-container ${mode} ${isReduced ? 'reduced-motion' : ''}`}>
      {/* Global animated background */}
      <AnimatedBackground />
      
      {/* Custom interactive cursor */}
      <CustomCursor />
      
      {/* Mode toggle (chill, focus, energize) */}
      <ModeToggle />
      
      {/* Main content sections */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <AppDemoSection />
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
