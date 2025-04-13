// src/components/landing_page/LandingPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './LandingPage.module.css';
import { landingPageAnimations } from '../../utils/animation/transitions.js'; 
import OButton from '../Obutton/Obutton.jsx';

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

  // 🔄 UPDATE: Custom animations for OButton to match existing behavior
  const customAnimations = {
    exit: {
      config: landingPageAnimations.buttonAnimation.config,
      onRest: () => {
        if (isExiting && animationPhase === 'exiting') {
          // Button animation has completed, move to next phase immediately
          setAnimationPhase('completed');
        }
      }
    },
    floating: {
      config: landingPageAnimations.buttonAnimation.floatingConfig
    }
  };

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
          <p>Orain, online.</p>
        </animated.div>
        
        <div className={styles.buttonWrapper}>
          {/* 🔄 UPDATE: Replaced button with reusable OButton component */}
          <OButton 
            ref={buttonRef}
            onClick={handleButtonClick}
            disabled={isExiting}
            isExiting={isExiting}
            customAnimations={customAnimations}
            ariaLabel="Escaparate Comercial"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
          />
        </div>
      </animated.div>
    </animated.div>
  );
};

export default LandingPage;