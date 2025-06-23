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

// Neural particles floating in the background with neural connections
const NeuralParticles = () => {
  const { animationMode, intensity, mousePosition, scrollProgress, reduceMotion } = useAnimationContext();
  
  // Create particles based on mode and intensity
  const count = useMemo(() => {
    if (reduceMotion) return 100;
    return animationMode === 'chill' ? 300 : animationMode === 'focus' ? 500 : 800;
  }, [animationMode, reduceMotion]);
  
  // Group particles into neuron clusters
  const clusters = useMemo(() => {
    const clusterCount = reduceMotion ? 3 : 8;
    const centers = [];
    
    // Generate cluster centers
    for (let i = 0; i < clusterCount; i++) {
      centers.push({
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 40
      });
    }
    
    return centers;
  }, [reduceMotion]);
  
  // Generate particles with cluster influence
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Determine which cluster this particle belongs to
      const clusterIndex = Math.floor(Math.random() * clusters.length);
      const cluster = clusters[clusterIndex];
      
      // Generate position with bias toward the cluster center
      const clusterBias = 0.7; // How strongly particles are drawn to their cluster
      const randomness = 1 - clusterBias;
      
      const x = (cluster.x + (Math.random() - 0.5) * 40 * randomness);
      const y = (cluster.y + (Math.random() - 0.5) * 40 * randomness);
      const z = (cluster.z + (Math.random() - 0.5) * 20 * randomness);
      
      // Particle properties
      const size = Math.random() * 0.8 + 0.2; // Larger particles for more dramatic effect
      const speed = Math.random() * 0.5 + 0.5; // Different speeds for more natural movement
      const pulseFrequency = Math.random() * 0.3 + 0.1; // For breathing effect
      const clusterCenter = clusterIndex; // Store which cluster this belongs to
      
      temp.push({ x, y, z, size, speed, pulseFrequency, clusterCenter });
    }
    return temp;
  }, [count, clusters]);
  
  const particlesMesh = useRef<THREE.Points>(null);
  const connectionsMesh = useRef<THREE.LineSegments>(null);
  const timeRef = useRef<number>(0);
  
  useFrame((state, delta) => {
    if (!particlesMesh.current || reduceMotion) return;
    
    // Update time reference for pulsating animations
    timeRef.current += delta;
    
    // Animation speed based on mode
    const baseSpeed = animationMode === 'chill' ? 0.03 : animationMode === 'focus' ? 0.06 : 0.09;
    
    // Rotate particles based on mouse position for interactive feel
    particlesMesh.current.rotation.y += delta * baseSpeed * intensity;
    particlesMesh.current.rotation.x = Math.sin(timeRef.current * 0.1) * 0.05; // Gentle breathing rotation
    
    // Move particles based on mouse position for interactive feel
    const mouseInfluence = 0.0002;
    particlesMesh.current.position.x += ((mousePosition.x / window.innerWidth - 0.5) * mouseInfluence);
    particlesMesh.current.position.y += ((mousePosition.y / window.innerHeight - 0.5) * mouseInfluence);
    
    // Scroll influence
    particlesMesh.current.position.y = -scrollProgress * 8;
    
    // Update neuron connections
    if (connectionsMesh.current) {
      connectionsMesh.current.rotation.y = particlesMesh.current.rotation.y;
      connectionsMesh.current.rotation.x = particlesMesh.current.rotation.x;
      connectionsMesh.current.position.x = particlesMesh.current.position.x;
      connectionsMesh.current.position.y = particlesMesh.current.position.y;
    }
    
    // Update particle sizes for breathing effect
    const geometry = particlesMesh.current.geometry;
    const sizes = geometry.attributes.size;
    
    for (let i = 0; i < sizes.count; i++) {
      const particle = particles[i];
      // Create a pulsing/breathing effect unique to each particle
      const pulseScale = 0.2 * Math.sin(timeRef.current * particle.pulseFrequency) + 1;
      sizes.setX(i, particle.size * pulseScale);
    }
    sizes.needsUpdate = true;
  });
  
  // Create particles geometry and materials
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    particles.forEach((particle, i) => {
      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;
      
      // Base size
      sizes[i] = particle.size;
      
      // Colors based on mode with more vibrant neon values
      if (animationMode === 'chill') {
        const brightness = Math.random() * 0.3 + 0.7; // Add variation
        colors[i * 3] = 0.2 * brightness; // More vibrant blue
        colors[i * 3 + 1] = 0.7 * brightness;
        colors[i * 3 + 2] = 1.0 * brightness;
      } else if (animationMode === 'focus') {
        const brightness = Math.random() * 0.2 + 0.8;
        colors[i * 3] = 0.7 * brightness; // Purple
        colors[i * 3 + 1] = 0.3 * brightness;
        colors[i * 3 + 2] = 1.0 * brightness;
      } else {
        const brightness = Math.random() * 0.3 + 0.7;
        colors[i * 3] = 0.0 * brightness; // Intense green
        colors[i * 3 + 1] = 1.0 * brightness;
        colors[i * 3 + 2] = 0.7 * brightness;
      }
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geometry;
  }, [count, particles, animationMode]);
  
  const particlesMaterial = useMemo(() => {
    // Create custom shader material that supports per-vertex sizing
    const material = new THREE.PointsMaterial({
      size: 0.5,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });
    
    // Enable size attenuation for the particles
    // @ts-ignore - Direct property access for size attribute
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        'uniform float size;',
        'uniform float size;\nattribute float particleSize;'
      );
      shader.vertexShader = shader.vertexShader.replace(
        'gl_PointSize = size;',
        'gl_PointSize = size * particleSize;'
      );
    };
    
    return material;
  }, []);
  
  // Create neural connections between particles in same cluster
  const connectionsGeometry = useMemo(() => {
    if (reduceMotion) return null;
    
    const geometry = new THREE.BufferGeometry();
    const connections: Array<number> = [];
    const positions: Array<number> = [];
    const colors: Array<number> = [];
    
    // Maximum distance for connections
    const maxDistance = 10;
    const maxConnectionsPerParticle = 3;
    
    // Process each cluster separately
    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
      // Get all particles in this cluster
      const clusterParticles = particles.filter(p => p.clusterCenter === clusterIndex);
      
      // Connect particles within the cluster
      clusterParticles.forEach((particle, i) => {
        let connectionCount = 0;
        
        // Find nearby particles to connect to
        for (let j = i + 1; j < clusterParticles.length && connectionCount < maxConnectionsPerParticle; j++) {
          const otherParticle = clusterParticles[j];
          
          // Calculate distance between particles
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const dz = particle.z - otherParticle.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          // Connect if close enough
          if (distance < maxDistance && Math.random() > 0.7) {
            positions.push(particle.x, particle.y, particle.z);
            positions.push(otherParticle.x, otherParticle.y, otherParticle.z);
            
            // Base connection color on animation mode
            let r, g, b;
            if (animationMode === 'chill') {
              r = 0.0; g = 0.5; b = 1.0; // Blue lines
            } else if (animationMode === 'focus') {
              r = 0.6; g = 0.0; b = 1.0; // Purple lines
            } else {
              r = 0.0; g = 1.0; b = 0.5; // Green lines
            }
            
            // Add colors for both vertices of the line
            colors.push(r, g, b, 1);
            colors.push(r, g, b, 1);
            
            connectionCount++;
          }
        }
      });
    }
    
    if (positions.length === 0) {
      // If no connections were created, return a minimal valid geometry
      positions.push(0,0,0, 0,0,0); // One degenerate line
      colors.push(0,0,0,0, 0,0,0,0); // Transparent colors
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    
    return geometry;
  }, [particles, clusters, animationMode, reduceMotion]);
  
  const connectionsMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
  }, []);
  
  return (
    <>
      <points ref={particlesMesh} geometry={particlesGeometry} material={particlesMaterial} />
      {!reduceMotion && connectionsGeometry && (
        <lineSegments ref={connectionsMesh} geometry={connectionsGeometry} material={connectionsMaterial} />
      )}
    </>
  );
};

// Animated wave forms using 3D meshes with neon glow and breathing effect
const WaveForms = () => {
  const { animationMode, intensity, mousePosition, scrollProgress, reduceMotion } = useAnimationContext();
  const wavesRef = useRef<THREE.Group>(null);
  const timeRef = useRef<number>(0);
  
  // Wave parameters based on mode - more dramatic values
  const waveParams = useMemo(() => {
    const baseSpeed = reduceMotion ? 0.1 : animationMode === 'chill' ? 0.3 : animationMode === 'focus' ? 0.5 : 0.8;
    const baseAmplitude = reduceMotion ? 0.5 : animationMode === 'chill' ? 1.2 : animationMode === 'focus' ? 1.8 : 2.5;
    const baseFrequency = animationMode === 'chill' ? 0.05 : animationMode === 'focus' ? 0.1 : 0.15;
    const pulseSpeed = animationMode === 'chill' ? 0.2 : animationMode === 'focus' ? 0.4 : 0.6;
    
    return { 
      speed: baseSpeed, 
      amplitude: baseAmplitude, 
      frequency: baseFrequency,
      pulseSpeed: pulseSpeed
    };
  }, [animationMode, reduceMotion]);
  
  // Create multiple wave layers with enhanced visual properties
  const waveLayers = useMemo(() => {
    const layers = [];
    // Add more layers for a more dramatic effect
    const layerCount = reduceMotion ? 1 : 5;
    
    const getLayerColor = (index: number) => {
      if (animationMode === 'chill') {
        // Blue gradient scheme
        return index === 0 ? '#00C2FF' : 
               index === 1 ? '#0084B0' : 
               index === 2 ? '#005F80' : 
               index === 3 ? '#003F55' : '#002A3B';
      } else if (animationMode === 'focus') {
        // Purple gradient scheme
        return index === 0 ? '#9200FF' : 
               index === 1 ? '#6E00C2' : 
               index === 2 ? '#51008F' : 
               index === 3 ? '#36005E' : '#22003B';
      } else {
        // Green gradient scheme
        return index === 0 ? '#00FFB2' : 
               index === 1 ? '#00D194' : 
               index === 2 ? '#00A073' : 
               index === 3 ? '#006D4D' : '#004D36';
      }
    };
    
    for (let i = 0; i < layerCount; i++) {
      const offsetFactor = i / layerCount;
      layers.push({
        position: [0, -5 - i * 3, -10 - i * 5],
        color: getLayerColor(i),
        speedFactor: 1 - offsetFactor * 0.2,  // More consistent speed across layers
        amplitudeFactor: 1 - offsetFactor * 0.15, // More consistent amplitude
        opacity: 1 - (i / layerCount) * 0.6, // Fade deeper layers
        subdivisions: Math.max(32, 128 - i * 24) // More detailed front waves
      });
    }
    
    return layers;
  }, [animationMode, reduceMotion]);
  
  useFrame(({ clock }, delta) => {
    if (!wavesRef.current || reduceMotion) return;
    
    // Update time for pulsing animations
    timeRef.current += delta;
    const time = clock.getElapsedTime();
    
    // Create breathing/pulsing effect on all waves
    const pulseScale = Math.sin(timeRef.current * waveParams.pulseSpeed) * 0.2 + 1.0;
    wavesRef.current.scale.set(1, pulseScale, 1);
    
    // Process each wave mesh
    wavesRef.current.children.forEach((child, idx) => {
      if (!(child instanceof THREE.Mesh)) return;
      
      const layer = waveLayers[idx];
      if (!layer) return;
      
      const positions = child.geometry.attributes.position;
      if (!positions) return;
      
      // Calculate wave deformation with more complex patterns
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        
        // Create interference pattern with multiple waves
        const waveX = Math.sin(x * waveParams.frequency + time * waveParams.speed * layer.speedFactor) * 
          waveParams.amplitude * intensity * layer.amplitudeFactor;
        const waveZ = Math.sin(z * waveParams.frequency * 1.3 + time * waveParams.speed * 0.7 * layer.speedFactor) * 
          waveParams.amplitude * intensity * layer.amplitudeFactor;
        
        // Add a second frequency for more complex patterns
        const wave2X = Math.sin(x * waveParams.frequency * 2.5 + time * waveParams.speed * 0.8) * 
          waveParams.amplitude * 0.3 * intensity * layer.amplitudeFactor;
        const wave2Z = Math.sin(z * waveParams.frequency * 2.1 + time * waveParams.speed * 1.2) * 
          waveParams.amplitude * 0.3 * intensity * layer.amplitudeFactor;
        
        // Mouse influence creates ripple effect around cursor
        const mouseX = (mousePosition.x / window.innerWidth - 0.5) * 10;
        const mouseY = (mousePosition.y / window.innerHeight - 0.5) * 10;
        const distanceToMouse = Math.sqrt(
          Math.pow(x - mouseX, 2) + 
          Math.pow(z - mouseY, 2)
        );
        
        // Create ripple effect from mouse position
        const rippleRadius = 8;
        const rippleFalloff = 2;
        const mouseInfluence = Math.sin(Math.max(0, rippleRadius - distanceToMouse) / rippleFalloff + time * 2) * 
          Math.max(0, (rippleRadius - distanceToMouse) / rippleRadius) * 2;
        
        // Scroll influence with smoother transition
        const scrollInfluence = scrollProgress * 3 * Math.pow((positions.count - i) / positions.count, 2);
        
        // Apply all deformations
        positions.setY(i, waveX + waveZ + wave2X + wave2Z + mouseInfluence - scrollInfluence);
      }
      
      positions.needsUpdate = true;
      
      // Update material intensity based on time for subtle pulsing glow
      if (child.material instanceof THREE.MeshStandardMaterial) {
        const glowPulse = Math.sin(time * 2 + idx) * 0.3 + 1.7;
        child.material.emissiveIntensity = glowPulse;
      }
    });
  });
  
  return (
    <group ref={wavesRef}>
      {waveLayers.map((layer, idx) => (
        <mesh key={idx} position={layer.position as [number, number, number]} rotation={[-Math.PI / 3, 0, 0]}>
          <planeGeometry args={[120, 120, layer.subdivisions, layer.subdivisions]} />
          <meshStandardMaterial 
            color={layer.color} 
            wireframe={true}
            emissive={layer.color}
            emissiveIntensity={1.5}
            transparent
            opacity={layer.opacity}
            toneMapped={false} // More vibrant colors
          />
        </mesh>
      ))}
    </group>
  );
};

// Main animated background component with enhanced post-processing effects
const AnimatedBackground: React.FC = () => {
  const { animationMode, reduceMotion } = useAnimationContext();
  
  // Background color based on mode - darker for better contrast with neon effects
  const bgColor = useMemo(() => {
    if (animationMode === 'chill') return '#000c14'; // Darker blue
    if (animationMode === 'focus') return '#0a001a'; // Darker purple
    return '#001a0d'; // Darker green
  }, [animationMode]);
  
  // Bloom intensity and colors based on animation mode
  const bloomParams = useMemo(() => {
    if (animationMode === 'chill') {
      return { intensity: 1.5, luminanceThreshold: 0.1, luminanceSmoothing: 0.8 };
    } else if (animationMode === 'focus') {
      return { intensity: 1.8, luminanceThreshold: 0.05, luminanceSmoothing: 0.9 };
    } else {
      return { intensity: 2.0, luminanceThreshold: 0.15, luminanceSmoothing: 0.7 };
    }
  }, [animationMode]);
  
  // Performance optimization based on device capabilities
  const dpr = useMemo<[number, number]>(() => {
    if (reduceMotion) return [1, 1.5] as [number, number]; // Lower resolution for reduced motion
    return [1, 2] as [number, number]; // Higher resolution for normal mode
  }, [reduceMotion]);
  
  return (
    <div className="animated-background fixed top-0 left-0 w-full h-full -z-10">
      <Canvas dpr={dpr} camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 15, 70]} /> {/* More atmospheric fog */}
        <ambientLight intensity={0.3} /> {/* Dimmer ambient for better contrast */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />
        
        {/* Main animated elements */}
        <WaveForms />
        <NeuralParticles />
        
        {/* Enhanced post-processing effects */}
        {!reduceMotion && (
          <EffectComposer>
            <Bloom 
              intensity={bloomParams.intensity}
              luminanceThreshold={bloomParams.luminanceThreshold} 
              luminanceSmoothing={bloomParams.luminanceSmoothing} 
              height={300} 
            />
            <Noise opacity={0.035} />
          </EffectComposer>
        )}
      </Canvas>
      
      {/* Overlay gradient to enhance depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent to-black opacity-30" />
    </div>
  );
};

export default AnimatedBackground;
