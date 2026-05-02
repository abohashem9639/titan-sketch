import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Pure Three.js scene — no React reconciler, no version-compat issues.
 * Renders an animated distorted icosahedron + wireframe shell + particle field
 * that responds subtly to mouse movement.
 */
const Hero3DScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0x22d3ee, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pointLight1 = new THREE.PointLight(0x0ea5e9, 1.0, 50);
    pointLight1.position.set(-5, -5, -5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x67e8f9, 1.0, 50);
    pointLight2.position.set(0, 0, 4);
    scene.add(pointLight2);

    // ----- Distorted sphere (icosahedron with vertex displacement) -----
    const sphereGeom = new THREE.IcosahedronGeometry(1, 32);
    const basePositions = sphereGeom.attributes.position.array.slice() as Float32Array;
    const vertexCount = basePositions.length / 3;

    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x0891b2,
      emissiveIntensity: 0.45,
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.scale.setScalar(1.6);
    scene.add(sphere);

    // ----- Wireframe outer shell -----
    const wireGeom = new THREE.IcosahedronGeometry(1.08, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    wireMesh.scale.setScalar(1.6);
    scene.add(wireMesh);

    // ----- Particle field -----
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = Math.cbrt(Math.random()) * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.03,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // ----- Mouse tracking (normalized -1..1) -----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ----- Resize -----
    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // ----- Animation loop -----
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Rotate sphere
      sphere.rotation.y = t * 0.15;
      sphere.rotation.x = t * 0.08;
      sphere.position.x = mouse.x * 0.4;
      sphere.position.y = mouse.y * 0.3;

      // Rotate wireframe oppositely
      wireMesh.rotation.x = -t * 0.25;
      wireMesh.rotation.z = t * 0.15;
      wireMesh.position.copy(sphere.position);

      // Rotate particles
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.02;

      // Vertex distortion on the sphere
      const posAttr = sphereGeom.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < vertexCount; i++) {
        const ix = i * 3;
        const bx = basePositions[ix];
        const by = basePositions[ix + 1];
        const bz = basePositions[ix + 2];
        // Noise-like displacement using sine waves
        const n =
          Math.sin(bx * 2.2 + t * 1.3) * 0.07 +
          Math.cos(by * 2.5 + t * 1.7) * 0.07 +
          Math.sin(bz * 2.8 + t * 1.1) * 0.07;
        const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        arr[ix] = bx + (bx / len) * n;
        arr[ix + 1] = by + (by / len) * n;
        arr[ix + 2] = bz + (bz / len) * n;
      }
      posAttr.needsUpdate = true;
      sphereGeom.computeVertexNormals();

      renderer.render(scene, camera);
    };
    animate();

    // ----- Cleanup -----
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      sphereGeom.dispose();
      sphereMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Hero3DScene;
