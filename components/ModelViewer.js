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
      let meshPositions = [];
      
      scene.traverse((object) => {
        if (object.isMesh) {
          console.log('Found mesh:', object.name);
          meshNames.push(object.name);
          
          // Store position data for mapping
          if (object.position) {
            meshPositions.push({
              name: object.name,
              position: object.position.clone()
            });
            console.log(`Mesh ${object.name} at position:`, object.position);
          }
          
          // Add event listeners directly to mesh for better click handling
          object.userData.clickable = true;
        }
      });
      
      console.log('All mesh names:', meshNames);
      console.log('Mesh positions:', meshPositions);
      
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
        }
      });
    }
  }, [scene, onLoaded]);
  
  // Handle pointer events
  useEffect(() => {
    // Reset all materials to original color
    if (scene) {
      scene.traverse((object) => {
        if (object.isMesh && object.userData.originalColor) {
          if (object.material && object.material.color) {
            object.material.color.copy(object.userData.originalColor);
            object.material.emissive = new THREE.Color(0x000000);
            object.material.emissiveIntensity = 0;
          }
        }
      });
    }
    
    // Highlight hovered object
    if (hovered && hovered.material) {
      hovered.material.emissive = new THREE.Color(0x33aaff);
      hovered.material.emissiveIntensity = 0.5;
    }
    
    // Highlight clicked object with a much more noticeable effect
    if (clicked && clicked.material) {
      if (clicked.material.color) {
        // Bright blue color for the selected part
        clicked.material.color = new THREE.Color(0x00aaff);
      }
      clicked.material.emissive = new THREE.Color(0x0066ff);
      clicked.material.emissiveIntensity = 1.5;
      
      // Add wireframe for even more visibility
      clicked.material.wireframe = true;
    }
  }, [hovered, clicked, scene]);
  
  const handleObjectClick = (e) => {
    e.stopPropagation();
    
    // Log information for debugging
    console.log('Clicked on object:', e.object.name);
    console.log('Click position:', e.point);
    console.log('World position Y:', e.point.y);
    
    // Set the clicked object
    setClicked(e.object);
    
    // Use normalized position for more consistent body part mapping
    // Scale factor to match our model's size (0.3)
    const scaledY = e.point.y / 0.3;
    console.log('Scaled Y position:', scaledY);
    
    // Determine which body part was clicked based on Y position
    let partId;
    
    // Position-based mapping - more reliable than name matching for this model
    if (scaledY > 3) {
      partId = 'head';
    } else if (scaledY > 2) {
      partId = 'neck';
    } else if (scaledY > 1) {
      partId = 'chest';
    } else if (scaledY > 0) {
      partId = 'abdomen';
    } else if (scaledY > -2) {
      partId = 'legs';
    } else {
      partId = 'feet';
    }
    
    console.log(`Position-based match: Y=${scaledY} → ${partId}`);
    
    // Fallback to name-based matching if needed
    if (!partId) {
      const meshName = e.object.name.toLowerCase();
      for (const [key, value] of Object.entries(bodyPartMap)) {
        if (meshName.includes(key.toLowerCase())) {
          partId = value;
          console.log(`Name match: ${meshName} → ${value}`);
          break;
        }
      }
    }
    
    // Call the part select callback with the identified part or default to 'body'
    if (partId && onPartSelect) {
      onPartSelect(partId);
      console.log('Selected body part:', partId);
    } else {
      onPartSelect('body');
      console.log('Selected generic body');
    }
  };
  
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(e.object);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  };
  
  return (
    <group 
      ref={group} 
      dispose={null}
      onClick={handleObjectClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={scene} scale={[0.3, 0.3, 0.3]} position={[0, -1, 0]} />
    </group>
  );
}

// Main ModelViewer component with canvas setup
export default function ModelViewer({ onPartSelect, onLoaded }) {
  const handleCanvasClick = (event) => {
    // Only reset selection if clicking on the canvas background (not the model)
    // Check if we have any intersections - if not, it's a background click
    if (!event.intersections || event.intersections.length === 0) {
      console.log('Background clicked - clearing selection');
      onPartSelect && onPartSelect(null);
    }
  };
  
  return (
    <Canvas style={{ backgroundColor: '#000000' }} onClick={handleCanvasClick}
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
        />
      </Suspense>
    </Canvas>
  );
}
