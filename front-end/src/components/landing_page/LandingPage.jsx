// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';

const LandingPage = ({ onProceedToLogin }) => {
  const { setShowTopBar } = useUI();
  const floatRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  
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

  // 🌊 Floating animation using a continuous loop
  const buttonAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      // Create an infinite loop of floating motion
      while (true) {
        // Float up gently
        await next({ transform: 'translateY(-15px)' });
        // Float down gently
        await next({ transform: 'translateY(0px)' });
      }
    },
    config: {
      tension: 40,    // Low tension for slow movement
      friction: 15,   // Higher friction for water resistance
      mass: 2,      // Higher mass for more inertia
    },
    delay: 500,       // Start after initial appearance
  });

  // Combine the initial fade-in with the floating animation
  const combinedButtonAnimation = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    delay: 300,
    config: { tension: 280, friction: 60 },
  });

  // 💜 UPDATE: Background color animation on hover
  const backgroundAnimation = useSpring({
    backgroundColor: isHovering 
      ? 'rgb(40, 10, 60)' // Dark purple when hovering
      : 'rgb(0, 0, 0)',    // Black by default
    config: { tension: 120, friction: 14 }, // Smooth transition
  });

  const handleButtonClick = () => {
    // Water ripple effect on click
    if (floatRef.current) {
      // Apply a CSS class for the click animation
      floatRef.current.classList.add(styles.buttonClick);
      
      // Remove the class after animation completes
      setTimeout(() => {
        if (floatRef.current) {
          floatRef.current.classList.remove(styles.buttonClick);
        }
      }, 300);
    }
    
    setShowTopBar(true);
    if (onProceedToLogin) {
      onProceedToLogin();
    }
  };

  // 💜 UPDATE: Handlers for mouse enter/leave events
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <animated.div 
      style={{
        ...containerAnimation,
        ...backgroundAnimation // 💜 UPDATE: Apply the background animation
      }} 
      className={styles.container}
    >
      <animated.div className={styles.heroSection}>
        <animated.div style={textAnimation} className={styles.heroContent}>
          <h1>Imagina tu barrio.</h1>
          <p>Aquí, orain.</p>
        </animated.div>
        
        <div className={styles.buttonWrapper}>
          <animated.button 
            ref={floatRef}
            style={{
              ...buttonAnimation,              // Floating movement
              opacity: combinedButtonAnimation.opacity,  // Fade in
              scale: combinedButtonAnimation.scale,      // Initial scaling
            }}
            className={styles.oButton}
            onClick={handleButtonClick}
            onMouseEnter={handleMouseEnter} // 💜 UPDATE: Add hover handlers
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter} // 💜 UPDATE: Add touch support for mobile
            onTouchEnd={handleMouseLeave}
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