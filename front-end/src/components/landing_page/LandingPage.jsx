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
  
  // Instead of using the complex continuous animation, we'll use a simpler 
  // approach with separate states for floating and exiting
  const [buttonY, setButtonY] = useState(0);
  
  // Floating effect using useEffect and setTimeout
  useEffect(() => {
    let floatingTimer;
    let direction = 'up';
    let currentY = 0;
    
    const floatStep = () => {
      if (isExiting) return; // Stop floating when exiting
      
      if (direction === 'up') {
        currentY -= 1;
        if (currentY <= -15) direction = 'down';
      } else {
        currentY += 1;
        if (currentY >= 0) direction = 'up';
      }
      
      setButtonY(currentY);
      floatingTimer = setTimeout(floatStep, 50);
    };
    
    floatingTimer = setTimeout(floatStep, 50);
    
    return () => clearTimeout(floatingTimer);
  }, [isExiting]);
  
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

  // Exit-specific animations - these will definitely work because they use
  // separate, explicit numeric values for each property
  const exitButtonAnimation = useSpring({
    y: isExiting ? -500 : buttonY, // Start from floating position, move up when exiting
    scale: isExiting ? 0.1 : 1,
    rotate: isExiting ? 1080 : 0,
    opacity: isExiting ? 0 : 1,
    config: {
      tension: 170,
      friction: 20,
    },
  });

  // Background color animation for hover and exit
  const backgroundAnimation = useSpring({
    backgroundColor: isExiting
      ? 'rgb(105, 0, 60)' // 💡 UPDATE: Turn red during exit animation - matching app color scheme
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
              // Using direct style properties for reliable animation
              transform: `translateY(${exitButtonAnimation.y}px) scale(${exitButtonAnimation.scale}) rotate(${exitButtonAnimation.rotate}deg)`,
              opacity: exitButtonAnimation.opacity,
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