import React from 'react';
import styles from './EqualizerLoader.module.css';

interface EqualizerLoaderProps {
  className?: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const EqualizerLoader: React.FC<EqualizerLoaderProps> = ({ 
  className, 
  message,
  size = 'medium'
}) => {
  const containerClasses = `${styles.container} ${styles[size]} ${className || ''}`.trim();

  return (
    <div className={styles.wrapper}>
      <div className={containerClasses} aria-label="Loading audio content">
        {/* Agora com apenas 5 barras */}
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};