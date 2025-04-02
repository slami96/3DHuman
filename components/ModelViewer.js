import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  PerspectiveCamera, 
  Html, 
  useProgress,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';

// Loading indicator component
function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>;
}

// Model component handling the 3D model display and interactions
function Model({ onPartSelect, onLoaded }) {
  const group = useRef();
  const [hovered, setHovered] = useState(null);
  const [clicked, setClicked] = useState(null);
  
  // Load the human body GLB file from the public folder
  const { scene } = useGLTF('/human_body.glb');
  
  // Map of mesh names to body part identifiers
  // This is updated based on what we can see in the model
  const bodyPartMap = {
    'head': 'head',
    'face': 'head',
    'skull': 'head',
    'neck': 'neck',
    'shoulder': 'shoulders',
    'arm': 'arms',
    'forearm': 'arms',
    'bicep': 'arms',
    'tricep': 'arms',
    'hand': 'hands',
    'finger': 'hands',
    'palm': 'hands',
    'chest': 'chest',
    'torso': 'chest',
    'abdomen': 'abdomen',
    'stomach': 'abdomen',
    'back': 'back',
    'spine': 'back',
    'leg': 'legs',
    'thigh': 'legs',
    'calf': 'legs',
    'shin': 'legs',
    'knee': 'legs',
    'foot': 'feet',
    'toe': 'feet',
    'ankle': 'feet'
  };
  
  // Called when model is loaded
  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully');
      // Log the names of all meshes in the model to help with mapping
      scene.traverse((object) => {
        if (object.isMesh) {
          console.log('Found mesh:', object.name);
        }
      });
      
      onLoaded && onLoaded();
      
      // Clone materials to allow for individual highlighting
      scene.traverse((object) => {
        if (object.isMesh) {
          // Make a copy of the material to avoid affecting other parts
          object.material = object.material.clone();
          
          // Store original color
          object.userData.originalColor = new THREE.Color(0xffffff);
          if (object.material.color) {
            object.userData.originalColor.copy(object.material.color);
          }
          
          // Set all meshes as interactive by default for this model
          object.userData.isInteractive = true;
          console.log('Interactive mesh:', object.name);
        }
      });
    }
  }, [scene, onLoaded]);
  
  // Handle pointer events
  useEffect(() => {
    // Reset all materials to original color
    scene && scene.traverse((object) => {
      if (object.isMesh && object.userData.originalColor) {
        if (object.material.color) {
          object.material.color.copy(object.userData.originalColor);
        }
        object.material.emissive = new THREE.Color(0x000000);
      }
    });
    
    // Highlight hovered object
    if (hovered && hovered.material) {
      hovered.material.emissive = new THREE.Color(0x666666);
    }
    
    // Highlight clicked object
    if (clicked && clicked.material && clicked.material.color) {
      clicked.material.color.set(0x66aaff);
      clicked.material.emissive = new THREE.Color(0x333333);
    }
  }, [hovered, clicked, scene]);
  
  return (
    <group 
      ref={group} 
      dispose={null}
      onClick={(e) => {
        e.stopPropagation();
        // Only process clicks on interactive body parts
        if (e.object.userData && e.object.userData.isInteractive) {
          setClicked(e.object);
          
          // Find the body part identifier from the mesh name
          const meshName = e.object.name.toLowerCase();
          let partId = null;
          
          for (const [key, value] of Object.entries(bodyPartMap)) {
            if (meshName.includes(key.toLowerCase())) {
              partId = value;
              console.log(`Identified part: ${meshName} as ${value}`);
              break;
            }
          }
          
          if (!partId) {
            // Fallback for meshes without specific naming patterns
            if (meshName.includes('upper') && meshName.includes('body')) {
              partId = 'chest';
            } else if (meshName.includes('lower') && meshName.includes('body')) {
              partId = 'legs';
            } else {
              // Default to a generic part if nothing else matches
              partId = 'body';
            }
          }
          
          if (partId && onPartSelect) {
            console.log('Selected part:', partId);
            onPartSelect(partId);
          }
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object.userData && e.object.userData.isInteractive) {
          setHovered(e.object);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (e.object.userData && e.object.userData.isInteractive) {
          setHovered(null);
          document.body.style.cursor = 'auto';
        }
      }}
    >
      <primitive object={scene} scale={[0.8, 0.8, 0.8]} position={[0, -2, 0]} />
    </group>
  );
}

// Main ModelViewer component with canvas setup
export default function ModelViewer({ onPartSelect, onLoaded }) {
  return (
    <Canvas style={{ backgroundColor: '#000000' }}>
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={0.5} />
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Model onPartSelect={onPartSelect} onLoaded={onLoaded} />
        <Environment preset="city" />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          initialPosition={[0, 0, 10]}
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
