import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import InfoPanel from '../components/InfoPanel';
import styles from '../styles/Home.module.css';

// Dynamically import the ModelViewer component with no SSR
const ModelViewer = dynamic(
  () => import('../components/ModelViewer'),
  { ssr: false }
);

// Data for body parts
const bodyPartsData = {
  body: {
    name: "Human Body",
    description: "The human body is the structure of a human being. It is composed of many different types of cells that together create tissues and subsequently organ systems.",
    functions: ["Houses all organs and systems", "Provides structure and support", "Enables movement", "Protects vital internal organs"]
  },
  head: {
    name: "Head",
    description: "The head contains the brain and major sensory organs such as the eyes, nose, ears, and mouth. It's protected by the skull.",
    functions: ["Houses the brain", "Contains sensory organs", "Enables facial expressions", "First part of the digestive system"]
  },
  neck: {
    name: "Neck",
    description: "The neck connects the head to the torso and contains vital passageways for air, food, and blood.",
    functions: ["Supports the head", "Contains the spinal cord", "Houses the trachea and esophagus", "Contains major blood vessels"]
  },
  shoulders: {
    name: "Shoulders",
    description: "The shoulders connect the arms to the torso and provide a wide range of motion for the arms.",
    functions: ["Joint connecting arm to torso", "Allows arm rotation and movement", "Attaches to major muscles", "Bears weight during activities"]
  },
  arms: {
    name: "Arms",
    description: "The arms consist of the upper arm (biceps/triceps) and forearm, providing strength and flexibility for various tasks.",
    functions: ["Enable lifting and carrying", "Allow precise manipulation", "Provide leverage for pushing/pulling", "House major arteries and veins"]
  },
  hands: {
    name: "Hands",
    description: "The hands are complex structures consisting of wrist bones, palm, and fingers, allowing for precise manipulation.",
    functions: ["Fine motor skills", "Tactile sensing", "Gripping objects", "Gesture communication"]
  },
  chest: {
    name: "Chest",
    description: "The chest (thorax) protects vital organs including the heart and lungs. It's enclosed by the ribcage.",
    functions: ["Protects heart and lungs", "Enables breathing", "Houses major blood vessels", "Attaches to arm and back muscles"]
  },
  abdomen: {
    name: "Abdomen",
    description: "The abdomen contains digestive organs, kidneys, and reproductive organs, protected by abdominal muscles.",
    functions: ["Core stability", "Houses digestive organs", "Protects internal organs", "Aids in posture and movement"]
  },
  back: {
    name: "Back",
    description: "The back contains the spine, supporting the body's structure and protecting the spinal cord.",
    functions: ["Structural support", "Protects spinal cord", "Enables bending and twisting", "Attaches to major muscle groups"]
  },
  legs: {
    name: "Legs",
    description: "The legs consist of thighs (quadriceps/hamstrings), knees, and calves, providing mobility and support.",
    functions: ["Body support and balance", "Movement and locomotion", "Power generation for activities", "Contains major muscle groups"]
  },
  feet: {
    name: "Feet",
    description: "The feet are complex structures of bones, muscles, and tendons that provide stability, balance, and mobility.",
    functions: ["Support body weight", "Absorb impact", "Enable walking/running", "Maintain balance and posture"]
  }
};

export default function Home() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle model click
  const handlePartSelect = (partName) => {
    if (partName === null) {
      setSelectedPart(null);
    } else if (bodyPartsData[partName]) {
      setSelectedPart(bodyPartsData[partName]);
    }
  };

  // Handle model loading status
  const handleModelLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Human Body</title>
        <meta name="description" content="Learn about the human body with 3D interaction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p>Loading 3D Model...</p>
          </div>
        )}
        
        <div className={styles.infoSection}>
          <InfoPanel 
            selectedPart={selectedPart} 
            onClose={() => setSelectedPart(null)}
          />
        </div>
        
        <div className={styles.modelSection}>
          <ModelViewer 
            onPartSelect={handlePartSelect} 
            onLoaded={handleModelLoaded}
          />
        </div>
      </main>
    </div>
  );
}
