// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const { setShowTopBar, setShowLandingPage } = useUI();
  const floatRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // 💡 UPDATE: Restored the original floating animation using useSpring
  const floatingAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      // Only run the floating animation when not exiting
      if (isExiting) return;
      
      // Create an infinite loop of floating motion
      while (!isExiting) {
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
  
  // Main container animation
  const containerAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    config: { tension: 280, friction: 60 },
    delay: isExiting ? 500 : 0,
  });

  // Text animations
  const textAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'translateY(-30px)' : 'translateY(0)',
    config: { tension: 280, friction: 30 },
    delay: isExiting ? 0 : 600,
  });

  // Exit-specific animation - separate from floating animation
  const exitAnimation = useSpring({
    // Only apply these properties when exiting
    from: { y: 0, scale: 1, rotate: 0 },
    to: { 
      y: isExiting ? -500 : 0, 
      scale: isExiting ? 0.1 : 1, 
      rotate: isExiting ? 1080 : 0 
    },
    config: {
      tension: 170,
      friction: 20,
    },
    // Don't run this animation until exiting
    immediate: !isExiting,
  });

  // Button fade animation
  const fadeAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    delay: isExiting ? 300 : 0,
    config: { tension: 280, friction: 60 },
  });

  // Background color animation for hover and exit
  const backgroundAnimation = useSpring({
    backgroundColor: isExiting
      ? 'rgb(231, 61, 158)' // Turn red during exit animation - matching app color scheme
      : isHovering 
        ? 'rgb(40, 10, 60)' // Purple on hover
        : 'rgb(0, 0, 0)',    // Default black
    config: { 
      tension: 120, 
      friction: 14,
      duration: isExiting ? 600 : undefined // Slightly longer transition for exit
    },
  });

  const handleButtonClick = () => {
    // Water ripple effect
    if (floatRef.current) {
      floatRef.current.classList.add(styles.buttonClick);
      setTimeout(() => {
        if (floatRef.current) {
          floatRef.current.classList.remove(styles.buttonClick);
        }
      }, 300);
    }
    
    // Trigger exit animations
    setIsExiting(true);
    
    // Navigate after animations complete
    setTimeout(() => {
      setShowTopBar(true);
      setShowLandingPage(false);
    }, 900);
  };

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
        ...backgroundAnimation 
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
              // 💡 UPDATE: Use floating animation when not exiting, exit animation when exiting
              // This is the key change to restore floating while keeping exit animation
              transform: isExiting
                ? `translateY(${exitAnimation.y}px) scale(${exitAnimation.scale}) rotate(${exitAnimation.rotate}deg)`
                : floatingAnimation.transform,
              opacity: fadeAnimation.opacity,
            }}
            className={styles.oButton}
            onClick={handleButtonClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
            aria-label="Escaparate Comercial"
            disabled={isExiting}
          >
            O
          </animated.button>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default LandingPage;