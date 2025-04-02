import { useState } from 'react';
import dynamic from 'next/dynamic';
import InfoPanel from '../components/InfoPanel';

// Import with no SSR to avoid Three.js DOM issues
const ModelViewer = dynamic(() => import('../components/ModelViewer'), { ssr: false });

export default function Home() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          <div>Loading 3D model...</div>
        </div>
      )}
      
      <div style={{ width: '30%', minWidth: '300px' }}>
        <InfoPanel 
          selectedPart={selectedPart} 
          onClose={() => setSelectedPart(null)} 
        />
      </div>
      
      <div style={{ flex: 1 }}>
        <ModelViewer 
          onSelectPart={setSelectedPart} 
          onLoaded={() => setLoading(false)} 
        />
      </div>
    </div>
  );
}
