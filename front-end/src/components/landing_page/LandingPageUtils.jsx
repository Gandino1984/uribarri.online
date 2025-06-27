// src/utils/LandingPageUtils.jsx
import { useEffect, useState } from 'react';
import { useSpring } from '@react-spring/web';
import { landingPageAnimations } from '../../utils/animation/transitions';

/**
 * 🚀 UPDATE: Custom hook to handle landing page hover and exit states
 * @returns {Object} Hover and exit state management functions
 */
export const useLandingPageStates = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('default'); // 'default', 'exiting', 'completed'
  
  // Button click handler to start exit animation
  const handleButtonClick = () => {
    setIsExiting(true);
    setAnimationPhase('exiting');
  };

  // Mouse enter handler for hover effects
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  // Mouse leave handler to reset hover state
  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Advance animation phase when button animation completes
  const handleButtonAnimationComplete = () => {
    if (isExiting && animationPhase === 'exiting') {
      setAnimationPhase('completed');
    }
  };

  return {
    // State values
    isHovering,
    isExiting,
    animationPhase,
    // State setters
    setAnimationPhase,
    // Event handlers
    handleButtonClick,
    handleMouseEnter,
    handleMouseLeave,
    handleButtonAnimationComplete
  };
};

/**
 * 🚀 UPDATE: Custom hook to manage the navigation after animation completes
 * @param {Function} setShowTopBar - Function to set top bar visibility
 * @param {Function} setShowLandingPage - Function to set landing page visibility
 * @param {String} animationPhase - Current phase of animation
 */
export const useNavigationEffect = (setShowTopBar, setShowLandingPage, animationPhase) => {
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
};

/**
 * 🚀 UPDATE: Custom hook to create all needed animations for LandingPage
 * @param {Boolean} isHovering - Whether button is being hovered
 * @param {Boolean} isExiting - Whether page is exiting
 * @param {String} animationPhase - Current animation phase
 * @param {Function} handleButtonAnimationComplete - Called when button animation completes
 * @returns {Object} All animation springs and configs for the component
 */
export const useLandingPageAnimations = (
  isHovering, 
  isExiting, 
  animationPhase,
  handleButtonAnimationComplete
) => {
  // Container background animation with proper state handling
  const backgroundAnimation = useSpring({
    backgroundColor: isExiting 
      ? landingPageAnimations.containerAnimation.exit.backgroundColor 
      : (isHovering 
          ? landingPageAnimations.containerAnimation.hover.backgroundColor 
          : landingPageAnimations.containerAnimation.default.backgroundColor),
    zIndex: landingPageAnimations.containerAnimation.default.zIndex,
    opacity: animationPhase === 'completed' ? 0 : 1,
    config: {
      ...landingPageAnimations.containerAnimation.config,
      opacity: landingPageAnimations.containerAnimation.opacityConfig
    }
  });

  // Background color animation for button hover
  const backgroundHoverAnimation = useSpring({
    backgroundColor: isHovering 
      ? landingPageAnimations.backgroundHoverAnimation.hover.backgroundColor 
      : landingPageAnimations.backgroundHoverAnimation.default.backgroundColor,
    config: landingPageAnimations.backgroundHoverAnimation.config
  });

  // Text animation
  const textAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'translateY(-30px)' : 'translateY(0)',
    config: landingPageAnimations.textAnimation.config
  });

  // Page exit animation
  const pageExitSpring = useSpring({
    ...landingPageAnimations.pageExitAnimation.from,
    to: isExiting 
      ? landingPageAnimations.pageExitAnimation.to 
      : landingPageAnimations.pageExitAnimation.from,
    config: landingPageAnimations.pageExitAnimation.config
  });

  // Custom animations for OButton
  const customAnimations = {
    exit: {
      config: landingPageAnimations.buttonAnimation.config,
      onRest: handleButtonAnimationComplete
    },
    floating: {
      config: landingPageAnimations.buttonAnimation.floatingConfig
    }
  };

  return {
    backgroundAnimation,
    backgroundHoverAnimation,
    textAnimation,
    pageExitSpring,
    customAnimations
  };
};