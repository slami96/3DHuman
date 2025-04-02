import React from 'react';

const bodyPartsInfo = {
  head: {
    name: "Head",
    description: "The head contains the brain and major sensory organs.",
    functions: ["Houses the brain", "Contains sensory organs", "Enables facial expressions"]
  },
  neck: {
    name: "Neck",
    description: "The neck connects the head to the torso.",
    functions: ["Supports the head", "Contains the spinal cord", "Houses the trachea and esophagus"]
  },
  shoulders: {
    name: "Shoulders",
    description: "The shoulders connect the arms to the torso.",
    functions: ["Enables arm movement", "Supports weight", "Attaches to major muscles"]
  },
  chest: {
    name: "Chest",
    description: "The chest protects vital organs including the heart and lungs.",
    functions: ["Protects heart and lungs", "Enables breathing", "Houses major blood vessels"]
  },
  abdomen: {
    name: "Abdomen",
    description: "The abdomen contains digestive organs protected by muscles.",
    functions: ["Houses digestive organs", "Provides core stability", "Protects internal organs"]
  },
  legs: {
    name: "Legs",
    description: "The legs provide mobility and support the body's weight.",
    functions: ["Body support", "Movement", "Power generation"]
  },
  feet: {
    name: "Feet",
    description: "The feet provide stability, balance, and mobility.",
    functions: ["Support body weight", "Absorb impact", "Enable walking"]
  }
};

export default function InfoPanel({ selectedPart, onClose }) {
  const partInfo = selectedPart ? bodyPartsInfo[selectedPart] : null;
  
  if (!partInfo) {
    return (
      <div style={{
        padding: '20px',
        height: '100%',
        color: '#f0f0f0',
        backgroundColor: '#111111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#3498db' }}>Interactive Human Body</h1>
        <p>Click on any part of the body to learn more about it.</p>
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '20px',
      height: '100%',
      color: '#f0f0f0',
      backgroundColor: '#111111',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: '#3498db' }}>{partInfo.name}</h1>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#2c3e50',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p>{partInfo.description}</p>
      </div>
      
      <div>
        <h3 style={{ color: '#2ecc71' }}>Functions:</h3>
        <ul>
          {partInfo.functions.map((func, index) => (
            <li key={index}>{func}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
