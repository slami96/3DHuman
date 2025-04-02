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
  // This is a simplified map - we'll update it after examining the actual model
  const bodyPartMap = {
    'Head': 'head',
    'Neck': 'neck',
    'Shoulder': 'shoulders',
    'Arm': 'arms',
    'Hand': 'hands',
    'Chest': 'chest',
    'Abdomen': 'abdomen',
    'Back': 'back',
    'Leg': 'legs',
    'Foot': 'feet'
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
          
          // Check if this mesh name contains any of our mapped body parts
          const partFound = Object.keys(bodyPartMap).some(key => 
            object.name.toLowerCase().includes(key.toLowerCase())
          );
          
          object.userData.isInteractive = partFound;
          
          if (partFound) {
            console.log('Interactive part found:', object.name);
          }
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
      hovered.material.emissive = new THREE.Color(0x333333);
    }
    
    // Highlight clicked object
    if (clicked && clicked.material && clicked.material.color) {
      clicked.material.color.set(0x3388ff);
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
          const meshName = e.object.name;
          let partId = null;
          
          for (const [key, value] of Object.entries(bodyPartMap)) {
            if (meshName.toLowerCase().includes(key.toLowerCase())) {
              partId = value;
              break;
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
