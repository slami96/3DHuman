import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, useProgress, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Loader() {
  const { progress, item } = useProgress();
  return (
    <Html center>
      <div style={{
        width: '200px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.8)',
        padding: '12px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <div style={{
          width: '100%',
          height: '20px',
          background: '#333',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3498db, #2ecc71)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ marginTop: '8px' }}>
          {progress.toFixed(0)}% loaded
        </div>
      </div>
    </Html>
  );
}

// Define clickable points for different body parts - completely revised positions
const bodyPartPoints = [
  { id: 'head', position: [0, 0.7, 0], label: 'Head' },
  { id: 'neck', position: [0, 0.4, 0], label: 'Neck' },
  { id: 'shoulders', position: [0.8, 0.2, 0], label: 'Shoulders' },
  { id: 'arms', position: [1.1, -0.2, 0], label: 'Arms' },
  { id: 'hands', position: [1.4, -0.8, 0], label: 'Hands' },
  { id: 'chest', position: [0, -0.1, 0.1], label: 'Chest' },
  { id: 'back', position: [0, -0.1, -0.2], label: 'Back' },
  { id: 'abdomen', position: [0, -0.5, 0.1], label: 'Abdomen' },
  { id: 'legs', position: [0.3, -1.2, 0], label: 'Legs' },
  { id: 'feet', position: [0.3, -1.8, 0], label: 'Feet' }
];

function ClickablePoint({ position, label, onSelect, partId, isSelected }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Clickable sphere */}
      <Sphere 
        args={[0.12, 16, 16]} 
        onClick={() => onSelect(partId)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={isSelected ? '#ff3366' : (hovered ? '#66ccff' : '#3498db')} 
          emissive={isSelected ? '#ff0000' : (hovered ? '#0088cc' : '#2980b9')}
          emissiveIntensity={isSelected ? 2 : (hovered ? 1.5 : 1)}
        />
      </Sphere>
      
      {/* Text label - always visible now */}
      <Html position={[0, 0.15, 0]} center>
        <div style={{
          background: isSelected ? 'rgba(255,50,100,0.9)' : 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none', // Prevents the label from blocking clicks
          opacity: hovered || isSelected ? 1 : 0.8,
          transform: `scale(${hovered || isSelected ? 1.1 : 1})`,
          transition: 'all 0.2s ease'
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function Model({ onSelect, onLoaded, selectedPart }) {
  const { scene } = useGLTF('/human_body.glb', undefined, (error) => {
    console.error('Error loading model:', error);
  });
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully');
      onLoaded && onLoaded();
      
      // Set a nice blue color for the human model
      scene.traverse((object) => {
        if (object.isMesh) {
          object.material = object.material.clone();
          object.material.color = new THREE.Color(0x5588cc);
          object.material.emissive = new THREE.Color(0x3366ff);
          object.material.emissiveIntensity = 0.2;
          object.material.transparent = true;
          object.material.opacity = 0.9;
        }
      });
    }
  }, [scene, onLoaded]);
  
  return (
    <group>
      {/* Human model */}
      <primitive 
        object={scene} 
        scale={[0.2, 0.2, 0.2]} 
        position={[0, 0, 0]}
      />
      
      {/* Clickable points for each body part */}
      {bodyPartPoints.map((part) => (
        <ClickablePoint
          key={part.id}
          position={part.position}
          label={part.label}
          partId={part.id}
          onSelect={onSelect}
          isSelected={selectedPart === part.id}
        />
      ))}
    </group>
  );
}

export default function ModelViewer({ onSelectPart, onLoaded, selectedPart }) {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}>
      <Canvas 
        camera={{ position: [0, -0.5, 12], fov: 30 }} 
        onCreated={({ camera, gl }) => {
          console.log('Canvas created');
          // Set initial camera position for a wide view
          camera.position.set(0, -0.5, 12);
          camera.lookAt(0, -0.5, 0);
          
          // Set pixel ratio for better rendering quality
          gl.setPixelRatio(window.devicePixelRatio);
        }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.5} intensity={2} />
          <Model 
            onSelect={onSelectPart} 
            onLoaded={onLoaded}
            selectedPart={selectedPart}
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true}
            minDistance={4}
            maxDistance={20}
            target={[0, -0.5, 0]}
            // Start with a zoomed out view
            defaultDistance={12}
            // Limit rotation to keep the model oriented properly
            minPolarAngle={Math.PI/6}
            maxPolarAngle={Math.PI*5/6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
