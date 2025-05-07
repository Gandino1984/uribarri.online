import React from 'react';
import styles from './AnimatedO.module.css';

const AnimatedO = ({ className = '' }) => {
  return (
    <span className={`${styles.animatedO} ${className}`}>
      <span className={styles.letter}>o</span>
    </span>
  );
};

export default AnimatedO;