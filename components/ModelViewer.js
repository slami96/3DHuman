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
      
      // Log all mesh names to help with mapping
      let meshNames = [];
      scene.traverse((object) => {
        if (object.isMesh) {
          console.log('Found mesh:', object.name);
          meshNames.push(object.name);
        }
      });
      
      console.log('All mesh names:', meshNames);
      
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
        object.material.emissiveIntensity = 0;
      }
    });
    
    // Highlight hovered object
    if (hovered && hovered.material) {
      hovered.material.emissive = new THREE.Color(0x33aaff);
      hovered.material.emissiveIntensity = 0.5;
    }
    
    // Highlight clicked object
    if (clicked && clicked.material && clicked.material.color) {
      clicked.material.color = new THREE.Color(0x33ccff);
      clicked.material.emissive = new THREE.Color(0x3366ff);
      clicked.material.emissiveIntensity = 0.8;
    }
  }, [hovered, clicked, scene]);
  
  return (
    <group 
      ref={group} 
      dispose={null}
      onClick={(e) => {
        // Stop event propagation to prevent double-triggering
        e.stopPropagation();
        
        // Make sure we have a valid object
        if (!e.object || !e.object.isMesh) return;
        
        console.log('Clicked on object:', e.object.name);
        
        // Set the clicked object
        setClicked(e.object);
        
        // Determine which body part was clicked
        const meshName = e.object.name.toLowerCase();
        console.log('Trying to match mesh:', meshName);
        
        // Try to match with our body part map
        let partId = null;
        
        // Try direct matching first
        for (const [key, value] of Object.entries(bodyPartMap)) {
          if (meshName.includes(key.toLowerCase())) {
            partId = value;
            console.log(`Direct match: ${meshName} → ${value}`);
            break;
          }
        }
        
        // If no direct match, try to infer from position/name
        if (!partId) {
          // These are rough estimates based on possible Y-coordinate positions
          // This will need to be adjusted based on your specific model
          const position = e.point.y;
          console.log('Click position Y:', position);
          
          if (position > 1) {
            partId = 'head';
          } else if (position > 0.5) {
            partId = 'neck';
          } else if (position > 0) {
            partId = 'chest';
          } else if (position > -0.5) {
            partId = 'abdomen';
          } else if (position > -1) {
            partId = 'legs';
          } else {
            partId = 'feet';
          }
          
          console.log(`Position-based match: Y=${position} → ${partId}`);
        }
        
        // Call the part select callback
        if (partId && onPartSelect) {
          onPartSelect(partId);
          console.log('Selected part:', partId);
        } else {
          // Default fallback
          onPartSelect('body');
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(e.object);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        setHovered(null);
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={scene} scale={[0.3, 0.3, 0.3]} position={[0, -1, 0]} />
    </group>
  );
}

// Main ModelViewer component with canvas setup
export default function ModelViewer({ onPartSelect, onLoaded }) {
  // Background click handler
  const handleCanvasClick = (event) => {
    // Only trigger if we click directly on the canvas (not on a model part)
    if (event.object === undefined && onPartSelect) {
      onPartSelect(null);
    }
  };

  return (
    <Canvas 
      style={{ backgroundColor: '#000000' }}
      onClick={handleCanvasClick}
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={1.2} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} castShadow />
        <spotLight position={[-10, -10, -10]} angle={0.5} penumbra={1} intensity={1} />
        <hemisphereLight intensity={0.5} />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        <Model onPartSelect={onPartSelect} onLoaded={onLoaded} />
        <Environment preset="city" />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
          initialPosition={[0, 0, 15]}
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
