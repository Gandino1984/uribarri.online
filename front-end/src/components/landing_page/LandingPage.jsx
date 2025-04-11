// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';
import { landingPageAnimations, pageTransition } from '../../utils/animation/transitions.js'; 

const LandingPage = () => {
  const { setShowTopBar, setShowLandingPage } = useUI();
  const buttonRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // 🔄 UPDATE: Added state to coordinate animations
  const [animationPhase, setAnimationPhase] = useState('default'); // 'default', 'exiting', 'completed'
  
  // 🌟 UPDATE: Use background animation from transitions.js with enhanced states
  const backgroundAnimation = useSpring({
    ...landingPageAnimations.containerAnimation[isExiting ? 'exit' : (isHovering ? 'hover' : 'default')],
    to: {
      // Additional opacity animation for smooth fade out
      opacity: animationPhase === 'completed' ? 0 : 1,
    },
    config: {
      ...landingPageAnimations.containerAnimation.config,
      // ⚡ UPDATE: Even faster fade out than in transitions.js
      opacity: { duration: 200 }
    }
  });

  // 🎈 UPDATE: Floating animation with exit control
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

  // ⚡ UPDATE: Even faster exit animation for the button
  const exitAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting 
      ? 'translateY(-100px) scale(0.1) rotate(720deg)' 
      : 'translateY(0px) scale(1) rotate(0deg)',
    config: {
      tension: 170,   // Higher tension for faster animation
      friction: 10,   // Lower friction for faster animation
      mass: 1,        // Lower mass for faster response
      duration: 150   // Shorter duration for quicker animation
    },
    immediate: !isExiting, // Only apply when exiting
    onRest: () => {
      if (isExiting && animationPhase === 'exiting') {
        // Button animation has completed, move to next phase immediately
        setAnimationPhase('completed');
      }
    }
  });

  // ⚡ UPDATE: Faster text animation
  const textAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'translateY(-30px)' : 'translateY(0)',
    config: { 
      tension: 340, 
      friction: 24,
      duration: 150
    }
  });

  // ⚡ UPDATE: Faster page transition animation
  const pageExitSpring = useSpring({
    ...landingPageAnimations.pageExitAnimation.from,
    to: isExiting 
      ? landingPageAnimations.pageExitAnimation.to 
      : landingPageAnimations.pageExitAnimation.from,
    config: {
      ...landingPageAnimations.pageExitAnimation.config,
      duration: 150 // Even faster than in transitions.js
    }
  });

  // ⚡ UPDATE: Use useEffect with minimal delay for immediate transition
  useEffect(() => {
    if (animationPhase === 'completed') {
      // When animations are complete, notify parent components immediately
      const timer = setTimeout(() => {
        setShowTopBar(true);
        setShowLandingPage(false);
      }, 20); // Minimal delay - just enough to allow the page to start fading
      
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setShowTopBar, setShowLandingPage]);

  const handleButtonClick = () => {
    // Set animation phase to exiting to start the sequence
    setIsExiting(true);
    setAnimationPhase('exiting');
    
    // The rest is handled by useEffect when animation completes
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