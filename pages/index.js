import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InfoPanel from '../components/InfoPanel';

// Import with no SSR to avoid Three.js DOM issues
const ModelViewer = dynamic(() => import('../components/ModelViewer'), { 
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: 'white'
    }}>
      Loading viewer...
    </div>
  )
});

export default function Home() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Handle model loading completed
  const handleModelLoaded = () => {
    console.log('Model loading complete');
    setLoading(false);
  };
  
  // Handle body part selection
  const handleSelectPart = (partId) => {
    console.log('Selected body part:', partId);
    setSelectedPart(partId);
  };
  
  // Clear selection
  const handleClearSelection = () => {
    setSelectedPart(null);
  };
  
  useEffect(() => {
    // Add a safety timeout to remove loading screen if it gets stuck
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Forcing loading complete after timeout');
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading]);
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      overflow: 'hidden',
      backgroundColor: '#000000'
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          color: 'white'
        }}>
          <div>Loading 3D model... Please wait.</div>
        </div>
      )}
      
      <div style={{ width: '30%', minWidth: '300px' }}>
        <InfoPanel 
          selectedPart={selectedPart} 
          onClose={handleClearSelection} 
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <ModelViewer 
          onSelectPart={handleSelectPart} 
          onLoaded={handleModelLoaded}
          selectedPart={selectedPart} 
        />
      </div>
    </div>
  );
}
