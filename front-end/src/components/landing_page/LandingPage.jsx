// src/components/landing_page/LandingPage.jsx
import { useRef } from 'react';
import { animated } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../../public/css/LandingPage.module.css';
import { 
  useLandingPageStates, 
  useNavigationEffect, 
  useLandingPageAnimations 
} from './LandingPageUtils.jsx';
import OButton from '../Obutton/Obutton.jsx';

const LandingPage = () => {
  //update: Add setShowShopWindow to the destructured values
  const { setShowTopBar, setShowLandingPage, setShowShopWindow } = useUI();
  const buttonRef = useRef(null);
  
  // 🚀 UPDATE: Using the refactored utility hooks for cleaner component logic
  // Step 1: Manage component states
  const {
    isHovering,
    isExiting,
    animationPhase,
    handleButtonClick,
    handleMouseEnter,
    handleMouseLeave,
    handleButtonAnimationComplete
  } = useLandingPageStates();
  
  // Step 2: Manage animations based on states
  const {
    backgroundAnimation,
    backgroundHoverAnimation,
    textAnimation,
    pageExitSpring,
    customAnimations
  } = useLandingPageAnimations(
    isHovering, 
    isExiting, 
    animationPhase,
    handleButtonAnimationComplete
  );
  
  // Step 3: Handle navigation after animation completes
  //update: Pass setShowShopWindow to the navigation effect
  useNavigationEffect(setShowTopBar, setShowLandingPage, setShowShopWindow, animationPhase);

  return (
    <animated.div 
      style={{
        ...pageExitSpring,
        ...backgroundAnimation,
        ...backgroundHoverAnimation,
        willChange: 'opacity, transform, backgroundColor', // Performance optimization
      }} 
      className={styles.container}
    >
      <animated.div className={styles.heroSection}>
        <animated.div style={textAnimation} className={styles.heroContent}>
          <h1>Todo tu barrio.</h1>
          <p>uribarri.online</p>
        </animated.div>
        
        <div className={styles.buttonWrapper}>
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