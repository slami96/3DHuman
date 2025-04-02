import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, useProgress } from '@react-three/drei';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

function Model() {
  // Load the human body GLB file
  const { scene } = useGLTF('/human_body.glb');
  
  // Log information about the loaded model
  console.log('Model scene loaded:', scene);
  
  return <primitive object={scene} scale={[1, 1, 1]} position={[0, -1, 0]} />;
}

export default function TestPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        zIndex: 10,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h2>3D Model Test</h2>
        <p>This page tests if your model loads correctly.</p>
        <p>Rotate: Left mouse button</p>
        <p>Pan: Right mouse button</p>
        <p>Zoom: Scroll wheel</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Model />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
