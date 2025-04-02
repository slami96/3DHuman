import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)}% loaded</Html>;
}

function Model({ onSelect }) {
  const { scene } = useGLTF('/human_body.glb');
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  
  useEffect(() => {
    // Clone materials for individual coloring
    scene.traverse((object) => {
      if (object.isMesh) {
        object.material = object.material.clone();
        // Store original color
        object.userData.originalColor = object.material.color.clone();
      }
    });
    
    // Reset colors and apply highlighting
    return () => {
      scene.traverse((object) => {
        if (object.isMesh && object.userData.originalColor) {
          object.material.color.copy(object.userData.originalColor);
        }
      });
    };
  }, [scene]);
  
  // Update material colors when selection changes
  useEffect(() => {
    // Reset all materials
    scene.traverse((object) => {
      if (object.isMesh && object.userData.originalColor) {
        object.material.color.copy(object.userData.originalColor);
        object.material.emissive = new THREE.Color(0x000000);
      }
    });
    
    // Highlight selected object
    if (selected) {
      selected.material.color.set(0x00aaff);
      selected.material.emissive.set(0x0066ff);
    }
    
    // Highlight hovered object
    if (hovered && hovered !== selected) {
      hovered.material.emissive.set(0x333333);
    }
  }, [scene, hovered, selected]);
  
  // Determine body part based on position
  const getBodyPart = (position) => {
    const y = position.y;
    
    if (y > 0.8) return 'head';
    if (y > 0.6) return 'neck';
    if (y > 0.2) return 'shoulders';
    if (y > 0) return 'chest';
    if (y > -0.3) return 'abdomen';
    if (y > -0.6) return 'legs';
    return 'feet';
  };
  
  return (
    <primitive 
      object={scene} 
      scale={[0.3, 0.3, 0.3]} 
      position={[0, -1, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(e.object);
        
        // Get part based on Y position
        const part = getBodyPart(e.point);
        onSelect(part);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(e.object);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
}

export default function ModelViewer({ onSelectPart }) {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.5} intensity={2} />
          <Model onSelect={onSelectPart} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true}
            minDistance={3}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
