// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';
import { landingPageAnimations } from '../../utils/animation/transitions.js'; 

const LandingPage = () => {
  const { setShowTopBar, setShowLandingPage } = useUI();
  const buttonRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('default'); // 'default', 'exiting', 'completed'
  
  // Container background animation with proper state handling
  const backgroundAnimation = useSpring({
    ...landingPageAnimations.containerAnimation[isExiting ? 'exit' : (isHovering ? 'hover' : 'default')],
    to: {
      // Additional opacity animation for smooth fade out
      opacity: animationPhase === 'completed' ? 0 : 1,
    },
    config: {
      ...landingPageAnimations.containerAnimation.config,
      opacity: { 
        duration: 150 // Ultra-fast fade-out
      }
    }
  });

  // Background color animation for button hover
  const backgroundHoverAnimation = useSpring({
    backgroundColor: isHovering 
      ? landingPageAnimations.backgroundHoverAnimation.hover.backgroundColor 
      : landingPageAnimations.backgroundHoverAnimation.default.backgroundColor,
    config: landingPageAnimations.backgroundHoverAnimation.config
  });

  // Floating animation with exit control
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

  // ⚡ UPDATE: Ultra-fast button exit animation
  const exitAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting 
      ? 'translateY(-100px) scale(0.1) rotate(720deg)' 
      : 'translateY(0px) scale(1) rotate(0deg)',
    config: landingPageAnimations.buttonAnimation.config,
    immediate: !isExiting, // Only apply when exiting
    onRest: () => {
      if (isExiting && animationPhase === 'exiting') {
        // Button animation has completed, move to next phase immediately
        setAnimationPhase('completed');
      }
    }
  });

  // ⚡ UPDATE: Ultra-fast text animation
  const textAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'translateY(-30px)' : 'translateY(0)',
    config: landingPageAnimations.textAnimation.config
  });

  // ⚡ UPDATE: Ultra-fast page exit animation
  const pageExitSpring = useSpring({
    ...landingPageAnimations.pageExitAnimation.from,
    to: isExiting 
      ? landingPageAnimations.pageExitAnimation.to 
      : landingPageAnimations.pageExitAnimation.from,
    config: landingPageAnimations.pageExitAnimation.config
  });

  // ⚡ UPDATE: Ultra-fast transition to login form
  useEffect(() => {
    if (animationPhase === 'completed') {
      // Switch to login form with minimal delay
      const timer = setTimeout(() => {
        setShowTopBar(true);
        setShowLandingPage(false);
      }, 10); // Minimum possible delay for smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setShowTopBar, setShowLandingPage]);

  const handleButtonClick = () => {
    // Start the exit animation sequence
    setIsExiting(true);
    setAnimationPhase('exiting');
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
        ...pageExitSpring,
        ...backgroundAnimation,
        ...backgroundHoverAnimation, // Restored hover effect
        willChange: 'opacity, transform, backgroundColor', // Performance optimization
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