import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

function Loader() {
  const { progress, item, loaded, total } = useProgress();
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
        <div style={{ marginBottom: '8px' }}>
          {loaded}/{total} objects loaded
        </div>
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
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          {item}
        </div>
      </div>
    </Html>
  );
}

function Model({ onSelect, onLoaded }) {
  const { scene } = useGLTF('/human_body.glb', undefined, (error) => {
    console.error('Error loading model:', error);
  });
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const { gl } = useThree();
  
  // Notify parent when model is loaded
  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully');
      onLoaded && onLoaded();
      
      // Clone materials for individual coloring
      scene.traverse((object) => {
        if (object.isMesh) {
          object.material = object.material.clone();
          // Store original color
          object.userData.originalColor = object.material.color.clone();
        }
      });
    }
  }, [scene, onLoaded]);
  
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
    // Get world coordinates
    console.log('Click position:', position);
    
    // Since our model is scaled to 0.3, we'll adjust our coordinates
    const worldY = position.y / 0.3;
    console.log('Normalized Y position:', worldY);
    
    // Use a different set of thresholds based on our visual inspection
    if (worldY > 2) return 'head';
    if (worldY > 1.5) return 'neck';
    if (worldY > 0.5) return 'shoulders';
    if (worldY > 0) return 'chest';
    if (worldY > -1) return 'abdomen';
    if (worldY > -2) return 'legs';
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
        
        // Get position information
        console.log('Clicked at world position:', e.point);
        
        // Log mesh info for debugging
        console.log('Clicked on mesh:', e.object.name);
        console.log('Mesh position:', e.object.position);
        
        // Get part based on Y position
        const part = getBodyPart(e.point);
        console.log('Detected part:', part);
        
        // Pass to parent component
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

export default function ModelViewer({ onSelectPart, onLoaded }) {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }} onCreated={() => console.log('Canvas created')}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.5} intensity={2} />
          <Model 
            onSelect={onSelectPart} 
            onLoaded={onLoaded} 
          />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true}
            minDistance={3}
            maxDistance={20}
          />
          {/* Helper to visualize the axes - Red: X, Green: Y, Blue: Z */}
          <axesHelper args={[5]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
