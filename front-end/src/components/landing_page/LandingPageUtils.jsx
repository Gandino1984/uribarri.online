// src/utils/LandingPageUtils.jsx
import { useEffect, useState } from 'react';
import { useSpring } from '@react-spring/web';
import { landingPageAnimations } from '../../utils/animation/transitions';

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
 * //update: Modified to handle navigation based on user type
 * @param {Function} setShowTopBar - Function to set top bar visibility
 * @param {Function} setShowLandingPage - Function to set landing page visibility
 * @param {Function} setShowShopWindow - Function to set shop window visibility
 * @param {Function} setShowShopsListBySeller - Function to set shops list by seller visibility
 * @param {String} animationPhase - Current phase of animation
 * @param {Object} currentUser - Current user object with type_user property
 */
export const useNavigationEffect = (
  setShowTopBar, 
  setShowLandingPage, 
  setShowShopWindow, 
  setShowShopsListBySeller,
  animationPhase, 
  currentUser
) => {
  useEffect(() => {
    if (animationPhase === 'completed') {
      const timer = setTimeout(() => {
        setShowTopBar(true);
        setShowLandingPage(false);
        
        //update: Navigate based on user type
        if (currentUser && currentUser.type_user === 'seller') {
          setShowShopsListBySeller(true);
          setShowShopWindow(false);
        } else {
          // Default to ShopWindow for 'user' type or no user
          setShowShopWindow(true);
          setShowShopsListBySeller(false);
        }
      }, 10); // Minimum possible delay for smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setShowTopBar, setShowLandingPage, setShowShopWindow, setShowShopsListBySeller, currentUser]);
};

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