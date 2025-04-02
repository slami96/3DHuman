import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
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
  const { scene, nodes, materials } = useGLTF('/human_body.glb');
  
  // Map of mesh names to body part identifiers
  // This will need to be adjusted based on your specific model
  const bodyPartMap = {
    'Head': 'head',
    'Neck': 'neck',
    'RightShoulder': 'shoulders',
    'LeftShoulder': 'shoulders',
    'RightArm': 'arms',
    'LeftArm': 'arms',
    'RightHand': 'hands',
    'LeftHand': 'hands',
    'Chest': 'chest',
    'Abdomen': 'abdomen',
    'Back': 'back',
    'RightLeg': 'legs',
    'LeftLeg': 'legs',
    'RightFoot': 'feet',
    'LeftFoot': 'feet'
  };
  
  // Called when model is loaded
  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully');
      console.log('Available nodes:', Object.keys(nodes || {}));
      console.log('Available materials:', Object.keys(materials || {}));
      onLoaded && onLoaded();
      
      // Clone materials to allow for individual highlighting
      scene.traverse((object) => {
        if (object.isMesh) {
          object.material = object.material.clone();
          // Store original material color
          object.userData.originalColor = object.material.color.clone();
          
          // Make object interactive if it's in our body part map
          const name = object.name;
          if (Object.keys(bodyPartMap).some(key => name.includes(key))) {
            object.userData.isInteractive = true;
          }
        }
      });
    }
  }, [scene, onLoaded]);
  
  // Handle pointer events
  useEffect(() => {
    // Reset all materials
    scene && scene.traverse((object) => {
      if (object.isMesh && object.userData.originalColor) {
        object.material.color.copy(object.userData.originalColor);
        object.material.emissive = new THREE.Color(0x000000);
      }
    });
    
    // Highlight hovered object
    if (hovered) {
      hovered.material.emissive = new THREE.Color(0x333333);
    }
    
    // Highlight clicked object
    if (clicked) {
      clicked.material.color.set(0x3388ff);
    }
  }, [hovered, clicked, scene]);
  
  // Handle raycasting and interactions
  useFrame((state) => {
    // Optional: Add any per-frame updates here
  });
  
  return (
    <group 
      ref={group} 
      dispose={null}
      onClick={(e) => {
        e.stopPropagation();
        // Only process clicks on interactive body parts
        if (e.object.userData.isInteractive) {
          setClicked(e.object);
          
          // Find the body part identifier from the mesh name
          const meshName = e.object.name;
          let partId = null;
          
          for (const [key, value] of Object.entries(bodyPartMap)) {
            if (meshName.includes(key)) {
              partId = value;
              break;
            }
          }
          
          if (partId && onPartSelect) {
            onPartSelect(partId);
          }
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.object.userData.isInteractive) {
          setHovered(e.object);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (e.object.userData.isInteractive) {
          setHovered(null);
          document.body.style.cursor = 'auto';
        }
      }}
    >
      <primitive object={scene} scale={[1, 1, 1]} position={[0, -1, 0]} />
    </group>
  );
}

// Main ModelViewer component with canvas setup
export default function ModelViewer({ onPartSelect, onLoaded }) {
  return (
    <Canvas style={{ backgroundColor: '#000000' }}>
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45} />
        <Model onPartSelect={onPartSelect} onLoaded={onLoaded} />
        <Environment preset="city" />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={8}
        />
      </Suspense>
    </Canvas>
  );
}
