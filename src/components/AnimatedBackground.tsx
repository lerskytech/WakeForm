import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useAnimationContext } from '../contexts/AnimationContext';
import * as THREE from 'three';
// @ts-ignore - Module declaration missing but used at runtime
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
// @ts-ignore - Module declaration missing but used at runtime
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

// Add type definitions for Three.js objects
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'svgLoader': any;
    }
  }
}

// Extend Three.js with the SVGLoader
extend({ SVGLoader });

// Neural particles floating in the background
const NeuralParticles = () => {
  const { animationMode, intensity, mousePosition, scrollProgress, reduceMotion } = useAnimationContext();
  
  // Create particles based on mode and intensity
  const count = useMemo(() => {
    if (reduceMotion) return 100;
    return animationMode === 'chill' ? 200 : animationMode === 'focus' ? 300 : 500;
  }, [animationMode, reduceMotion]);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;
      const size = Math.random() * 0.5 + 0.1;
      temp.push({ x, y, z, size });
    }
    return temp;
  }, [count]);
  
  const particlesMesh = useRef<THREE.Points>(null);
  
  useFrame((_, delta) => {
    if (!particlesMesh.current || reduceMotion) return;
    
    // Animation speed based on mode
    const speed = animationMode === 'chill' ? 0.05 : animationMode === 'focus' ? 0.1 : 0.2;
    
    // Rotate particles slowly
    particlesMesh.current.rotation.y += delta * speed * intensity;
    
    // Move particles based on mouse/scroll
    const mouseInfluence = 0.0001;
    particlesMesh.current.position.x += (mousePosition.x / window.innerWidth - 0.5) * mouseInfluence;
    particlesMesh.current.position.y += (mousePosition.y / window.innerHeight - 0.5) * mouseInfluence;
    
    // Scroll influence
    particlesMesh.current.position.y = -scrollProgress * 10;
  });
  
  // Create geometry and materials
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    particles.forEach((particle, i) => {
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
      
      // Colors based on mode
      if (animationMode === 'chill') {
        colors[i * 3] = 0.5; // Blue-ish
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else if (animationMode === 'focus') {
        colors[i * 3] = 0.8; // White-ish
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.3; // Teal-ish
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0.8;
      }
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [count, particles, animationMode]);
  
  const particlesMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.2,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }, []);

  return (
    <points ref={particlesMesh} geometry={particlesGeometry} material={particlesMaterial} />
  );
};

// Animated wave forms using 3D meshes
const WaveForms = () => {
  const { animationMode, intensity, mousePosition, scrollProgress, reduceMotion } = useAnimationContext();
  const waveMesh = useRef<THREE.Mesh>(null);
  
  // Wave parameters based on mode
  const waveParams = useMemo(() => {
    const baseSpeed = reduceMotion ? 0.1 : animationMode === 'chill' ? 0.3 : animationMode === 'focus' ? 0.5 : 0.8;
    const baseAmplitude = reduceMotion ? 0.5 : animationMode === 'chill' ? 1 : animationMode === 'focus' ? 1.5 : 2;
    const baseFrequency = animationMode === 'chill' ? 0.05 : animationMode === 'focus' ? 0.1 : 0.15;
    
    return { speed: baseSpeed, amplitude: baseAmplitude, frequency: baseFrequency };
  }, [animationMode, reduceMotion]);
  
  // Create multiple wave layers
  const waveLayers = useMemo(() => {
    const layers = [];
    const layerCount = reduceMotion ? 1 : 3;
    
    for (let i = 0; i < layerCount; i++) {
      const offsetFactor = i / layerCount;
      layers.push({
        position: [0, -5 - i * 3, -10 - i * 5],
        color: i === 0 ? '#00C2FF' : i === 1 ? '#0084B0' : '#00FFB2',
        speedFactor: 1 - offsetFactor * 0.3,
        amplitudeFactor: 1 - offsetFactor * 0.2,
      });
    }
    
    return layers;
  }, [reduceMotion]);
  
  useFrame(({ clock }) => {
    if (!waveMesh.current || reduceMotion) return;
    
    const time = clock.getElapsedTime();
    const positions = waveMesh.current.geometry.attributes.position;
    
    // Calculate wave deformation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Wave animation
      const waveX = Math.sin(x * waveParams.frequency + time * waveParams.speed) * 
        waveParams.amplitude * intensity;
      const waveZ = Math.sin(z * waveParams.frequency + time * waveParams.speed) * 
        waveParams.amplitude * intensity;
      
      // Mouse influence on waves
      const mouseX = (mousePosition.x / window.innerWidth - 0.5) * 5;
      const mouseY = (mousePosition.y / window.innerHeight - 0.5) * 5;
      const distanceToMouse = Math.sqrt(
        Math.pow(x - mouseX, 2) + 
        Math.pow(z - mouseY, 2)
      );
      const mouseInfluence = Math.max(0, 5 - distanceToMouse) * 0.2;
      
      // Scroll influence
      const scrollInfluence = scrollProgress * 2;
      
      // Apply deformation
      positions.setY(i, waveX + waveZ + mouseInfluence - scrollInfluence);
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <>
      {waveLayers.map((layer, idx) => (
        <mesh key={idx} position={layer.position as [number, number, number]} rotation={[-Math.PI / 3, 0, 0]}>
          <planeGeometry args={[100, 100, 128, 128]} />
          <meshStandardMaterial 
            color={layer.color} 
            wireframe={true}
            emissive={layer.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );
};

// Main animated background component
const AnimatedBackground: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  
  // Background color based on mode
  const bgColor = useMemo(() => {
    if (animationMode === 'chill') return '#001424'; 
    if (animationMode === 'focus') return '#002548';
    return '#003B6D';
  }, [animationMode]);
  
  return (
    <div className="animated-background fixed top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 20, 80]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        {/* Main animated elements */}
        <WaveForms />
        <NeuralParticles />
        
        {/* Post-processing effects */}
        {!reduceMotion && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <Noise opacity={0.02} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
