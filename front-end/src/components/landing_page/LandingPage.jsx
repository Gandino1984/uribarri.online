// src/components/landing_page/LandingPage.jsx
import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from './LandingPage.module.css';

const LandingPage = ({ onProceedToLogin }) => {
  // Main container animation
  const containerAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 },
  });

  // Text animations
  const textAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 100,
    config: { tension: 280, friction: 60 },
  });

  // Button animation
  const buttonAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 300,
    config: { tension: 280, friction: 60 },
  });

  return (
    <animated.div style={containerAnimation} className={styles.container}>
      <animated.div className={styles.heroSection}>
        {/* 🔄 UPDATE: Text content at the top */}
        <animated.div style={textAnimation} className={styles.heroContent}>
          <h1>Imagina tu barrio</h1>
          <p>Aquí, orain.</p>
        </animated.div>
        
        {/* 🔄 UPDATE: Button centered in the middle of the screen */}
        <div className={styles.buttonWrapper}>
          <animated.button 
            style={buttonAnimation}
            className={styles.oButton}
            onClick={onProceedToLogin}
            aria-label="Escaparate Comercial"
          >
            O
          </animated.button>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default LandingPage;