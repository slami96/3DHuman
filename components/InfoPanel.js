import React from 'react';
import styles from '../styles/InfoPanel.module.css';

export default function InfoPanel({ selectedPart }) {
  return (
    <div className={styles.infoPanel}>
      <div className={styles.header}>
        <h1>Interactive Human Body</h1>
        <p className={styles.subtitle}>Click on a body part to learn more</p>
      </div>
      
      {selectedPart ? (
        <div className={styles.content}>
          <h2>{selectedPart.name}</h2>
          <div className={styles.description}>
            <p>{selectedPart.description}</p>
          </div>
          
          <div className={styles.functions}>
            <h3>Functions:</h3>
            <ul>
              {selectedPart.functions.map((func, index) => (
                <li key={index}>{func}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <h2>Welcome to the Interactive Human Body Explorer</h2>
          <p>Rotate the model using your mouse or touch, and click on any body part to learn more about it.</p>
          <p>This application allows you to explore the external anatomy of the human body in 3D.</p>
        </div>
      )}
      
      <div className={styles.footer}>
        <p>© {new Date().getFullYear()} Interactive Human Body Explorer</p>
      </div>
    </div>
  );
}
