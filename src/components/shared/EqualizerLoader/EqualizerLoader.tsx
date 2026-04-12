import React from 'react';
import styles from './EqualizerLoader.module.css';

interface EqualizerLoaderProps {
  className?: string;
}

export const EqualizerLoader: React.FC<EqualizerLoaderProps> = ({ className }) => {
  const containerClasses = `${styles.container} ${className || ''}`.trim();

  return (
    <div className={containerClasses} aria-label="Loading audio content">
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
    </div>
  );
};
