import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Points, PointMaterial, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Animated distorted sphere — the main centerpiece
const DistortedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;
    // Subtle mouse parallax
    const { x, y } = state.pointer;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, x * 0.4, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, y * 0.3, 0.05);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={1.6}>
        <icosahedronGeometry args={[1, 8]} />
        <MeshDistortMaterial
          color="#06b6d4"
          attach="material"
          distort={0.45}
          speed={1.8}
          roughness={0.15}
          metalness={0.85}
          emissive="#0891b2"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
};

// Inner wireframe core
const WireCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = -state.clock.getElapsedTime() * 0.25;
    meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.15;
  });
  return (
    <Icosahedron args={[1.05, 1]} ref={meshRef} scale={1.6}>
      <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.18} />
    </Icosahedron>
  );
};

// Particle starfield
const Particles = ({ count = 1500 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute in a sphere
      const r = Math.cbrt(Math.random()) * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#67e8f9"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
};

const Hero3DScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#22d3ee" />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#0ea5e9" />
        <pointLight position={[0, 0, 4]} intensity={0.8} color="#67e8f9" />

        {/* Scene */}
        <Particles count={1200} />
        <WireCore />
        <DistortedSphere />
      </Suspense>
    </Canvas>
  );
};

export default Hero3DScene;
