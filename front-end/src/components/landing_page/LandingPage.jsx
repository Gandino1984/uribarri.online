// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';
import { landingPageAnimations } from '../../utils/animation/transitions.js'; 

const LandingPage = () => {
  const { setShowTopBar, setShowLandingPage } = useUI();
  const buttonRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // 🌟 UPDATE: Use background animation from transitions.js
  const backgroundAnimation = useSpring({
    backgroundColor: isExiting
      ? landingPageAnimations.containerAnimation.exit.backgroundColor
      : isHovering 
        ? landingPageAnimations.containerAnimation.hover.backgroundColor
        : landingPageAnimations.containerAnimation.default.backgroundColor,
    config: landingPageAnimations.containerAnimation.config
  });

  // 🎈 UPDATE: Added constant floating animation for the button when not exiting
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
    config: landingPageAnimations.buttonAnimation.floatingConfig,
    immediate: isExiting, // Stop the animation immediately when exiting
  });

  // 🪐 UPDATE: Exit animation for the button
  const exitAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting 
      ? 'translateY(-100px) scale(0.1) rotate(720deg)' 
      : 'translateY(0px) scale(1) rotate(0deg)',
    config: landingPageAnimations.buttonAnimation.config,
    immediate: !isExiting // Only apply when exiting
  });

  // Text animation for fade effect
  const textAnimation = useSpring({
    opacity: isExiting ? landingPageAnimations.textAnimation.exit.opacity : landingPageAnimations.textAnimation.enter.opacity,
    transform: isExiting ? landingPageAnimations.textAnimation.exit.transform : landingPageAnimations.textAnimation.enter.transform,
    config: landingPageAnimations.textAnimation.config
  });

  // Container animation for fade effect
  const containerAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    config: { tension: 280, friction: 60 },
    delay: isExiting ? 500 : 0,
  });

  const handleButtonClick = () => {
    // 🪐 UPDATE: Enhanced button click handler for zero-gravity effect
    setIsExiting(true);
    
    // Navigate after animations complete - increased timeout to match new animation duration
    setTimeout(() => {
      setShowTopBar(true);
      setShowLandingPage(false);
    }, 1500); // Increased from 900ms to 1500ms to allow for full animation
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
            ref={buttonRef}
            style={isExiting ? exitAnimation : floatingAnimation}
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