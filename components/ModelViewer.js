import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Html, useProgress, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
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

// Define clickable points for different body parts
const bodyPartPoints = [
  { id: 'head', position: [0, 5, 0], label: 'Head' },
  { id: 'neck', position: [0, 4, 0], label: 'Neck' },
  { id: 'shoulders', position: [1.5, 3, 0], label: 'Shoulders' },
  { id: 'arms', position: [2.5, 1.5, 0], label: 'Arms' },
  { id: 'hands', position: [3, 0, 0], label: 'Hands' },
  { id: 'chest', position: [0, 2, 0.5], label: 'Chest' },
  { id: 'back', position: [0, 2, -0.5], label: 'Back' },
  { id: 'abdomen', position: [0, 0.5, 0], label: 'Abdomen' },
  { id: 'legs', position: [0.8, -2, 0], label: 'Legs' },
  { id: 'feet', position: [0.8, -4.5, 0], label: 'Feet' }
];

function CameraRig({ position = [0, 0, 15] }) {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set camera position to show the entire model
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(0, 0, 0);
  }, [camera, position]);
  
  return null;
}

function Controls() {
  const { camera, gl, scene } = useThree();
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleWheel = (event) => {
      // Zoom in/out
      const zoomSpeed = 0.1;
      const delta = Math.sign(event.deltaY) * zoomSpeed;
      const newZ = Math.max(5, Math.min(25, camera.position.z + delta));
      camera.position.z = newZ;
    };
    
    const handleMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging.current) return;
      
      const deltaX = event.clientX - previousMousePosition.current.x;
      const deltaY = event.clientY - previousMousePosition.current.y;
      
      // Rotate the camera around the model
      const rotationSpeed = 0.01;
      
      // Horizontal rotation (around Y axis)
      camera.position.x = camera.position.x * Math.cos(deltaX * rotationSpeed) + 
                          camera.position.z * Math.sin(deltaX * rotationSpeed);
      camera.position.z = -camera.position.x * Math.sin(deltaX * rotationSpeed) + 
                          camera.position.z * Math.cos(deltaX * rotationSpeed);
      
      // Vertical rotation (around X axis)
      const verticalLimit = Math.PI / 3; // Limit vertical rotation to 60 degrees
      const currentVerticalAngle = Math.atan2(
        camera.position.y,
        Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z)
      );
      
      const newVerticalAngle = currentVerticalAngle - deltaY * rotationSpeed;
      
      // Apply vertical rotation if within limits
      if (Math.abs(newVerticalAngle) < verticalLimit) {
        const dist = Math.sqrt(
          camera.position.x * camera.position.x + 
          camera.position.y * camera.position.y + 
          camera.position.z * camera.position.z
        );
        
        const theta = Math.atan2(camera.position.x, camera.position.z);
        const phi = Math.PI/2 - newVerticalAngle;
        
        camera.position.x = dist * Math.sin(phi) * Math.sin(theta);
        camera.position.y = dist * Math.cos(phi);
        camera.position.z = dist * Math.sin(phi) * Math.cos(theta);
      }
      
      camera.lookAt(scene.position);
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl, scene]);
  
  // Continuously update the camera to look at the center
  useFrame(() => {
    camera.lookAt(scene.position);
  });
  
  return null;
}

function ClickablePoint({ position, label, onSelect, partId, isSelected }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Clickable sphere */}
      <Sphere 
        args={[0.3, 16, 16]} 
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
      
      {/* Text label - always visible */}
      <Html position={[0, 0.5, 0]} center>
        <div style={{
          background: isSelected ? 'rgba(255,50,100,0.9)' : 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
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
      
      onLoaded && onLoaded();
    }
  }, [scene, onLoaded]);
  
  return (
    <group>
      {/* Human model */}
      <primitive 
        object={scene} 
        scale={[1, 1, 1]} 
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
      <Canvas>
        <CameraRig position={[0, 0, 25]} />
        <Controls />
        
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.5} intensity={2} />
          <Model 
            onSelect={onSelectPart} 
            onLoaded={onLoaded}
            selectedPart={selectedPart}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
