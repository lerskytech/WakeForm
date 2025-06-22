import React, { useEffect, useState } from 'react';
import { useAnimationContext } from './contexts/AnimationContext';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';
import ModeToggle from './components/ModeToggle';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppDemoSection from './components/AppDemoSection';
import CtaSection from './components/CtaSection';
import SectionDivider from './components/SectionDivider';
import Footer from './components/Footer';

function App() {
  const { setMousePosition, reduceMotion } = useAnimationContext();
  const [deviceOrientation, setDeviceOrientation] = useState({ beta: 0, gamma: 0 });

  // Track mouse movement for animations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        relativeX: e.clientX / window.innerWidth,
        relativeY: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setMousePosition]);

  // Track device orientation for mobile interactions
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setDeviceOrientation({
          beta: e.beta, // -180° to 180° (front-back tilt)
          gamma: e.gamma, // -90° to 90° (left-right tilt)
        });

        // Convert orientation to relative mouse position for animations
        const normalizedGamma = (Math.min(Math.max(e.gamma, -45), 45) + 45) / 90;
        const normalizedBeta = (Math.min(Math.max(e.beta, -45), 45) + 45) / 90;

        setMousePosition({
          x: normalizedGamma * window.innerWidth,
          y: normalizedBeta * window.innerHeight,
          relativeX: normalizedGamma,
          relativeY: normalizedBeta,
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [setMousePosition]);

  // Register keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add keyboard navigation handlers if needed
      if (e.key === 'Tab') {
        // We could add special effects for keyboard focus if needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="App">
      {/* Global animated background */}
      <AnimatedBackground />
      
      {/* Custom interactive cursor */}
      <CustomCursor />
      
      {/* Mode toggle (chill, focus, energize) */}
      <ModeToggle />
      
      {/* Main content sections */}
      <main>
        <HeroSection />
        <SectionDivider type="wave" />
        <FeaturesSection />
        <SectionDivider type="neural" inverted={true} />
        <AppDemoSection />
        <SectionDivider type="zigzag" />
        <CtaSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
