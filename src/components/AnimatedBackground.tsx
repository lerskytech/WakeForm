import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAnimation } from '../contexts/AnimationContext';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { extend } from '@react-three/fiber';

// Extend Three.js with the SVGLoader
extend({ SVGLoader });

// Neural particles floating in the background
const NeuralParticles = () => {
  const { mode, intensity, mousePosition, scrollProgress, isReduced } = useAnimation();
  
  // Create particles based on mode and intensity
  const count = useMemo(() => {
    if (isReduced) return 100;
    return mode === 'chill' ? 200 : mode === 'focus' ? 300 : 500;
  }, [mode, isReduced]);
  
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
    if (!particlesMesh.current || isReduced) return;
    
    // Animation speed based on mode
    const speed = mode === 'chill' ? 0.05 : mode === 'focus' ? 0.1 : 0.2;
    
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
      if (mode === 'chill') {
        colors[i * 3] = 0.5; // Blue-ish
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else if (mode === 'focus') {
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
  }, [count, particles, mode]);
  
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
  const { mode, intensity, mousePosition, scrollProgress, isReduced } = useAnimation();
  const waveMesh = useRef<THREE.Mesh>(null);
  
  // Wave parameters based on mode
  const waveParams = useMemo(() => {
    const baseSpeed = isReduced ? 0.1 : mode === 'chill' ? 0.3 : mode === 'focus' ? 0.5 : 0.8;
    const baseAmplitude = isReduced ? 0.5 : mode === 'chill' ? 1 : mode === 'focus' ? 1.5 : 2;
    const baseFrequency = mode === 'chill' ? 0.05 : mode === 'focus' ? 0.1 : 0.15;
    
    return { speed: baseSpeed, amplitude: baseAmplitude, frequency: baseFrequency };
  }, [mode, isReduced]);
  
  // Create multiple wave layers
  const waveLayers = useMemo(() => {
    const layers = [];
    const layerCount = isReduced ? 1 : 3;
    
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
  }, [isReduced]);
  
  useFrame(({ clock }) => {
    if (!waveMesh.current || isReduced) return;
    
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
  const { mode, isReduced } = useAnimation();
  
  // Background color based on mode
  const bgColor = useMemo(() => {
    if (mode === 'chill') return '#001424'; 
    if (mode === 'focus') return '#002548';
    return '#003B6D';
  }, [mode]);
  
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
        {!isReduced && (
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
