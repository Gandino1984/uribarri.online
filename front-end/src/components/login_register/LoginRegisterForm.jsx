import React, { useState, useEffect } from 'react';
import { useTransition, animated, useSpring } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import { formAnimation, gradientAnimation } from '../../utils/animation/transitions.js';
import styles from '../../../../public/css/LoginRegisterForm.module.css';

const FormContent = () => {
  return (
    <div className={styles.formContentWrapper}>
      <FormActions />
      <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
        <FormFields />
        <KeyboardSection />
      </form>
    </div>
  );
};

const LoginRegisterForm = () => {
  const { currentUser, type_user } = useAuth();
  const { 
    showShopManagement, 
    showLandingPage,
    setShowLandingPage,
    setShowTopBar  
  } = useUI();
  
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // ⚡ UPDATE: Immediately set ready state when landing page is gone
  useEffect(() => {
    if (!showLandingPage) {
      // Landing page is no longer showing, we can render immediately
      setIsReady(true);
    }
  }, [showLandingPage]);
  
  // ⚡ UPDATE: Enhanced background gradient animation with faster fade-in
  const gradientProps = useSpring({
    from: { 
      backgroundPosition: '0% 50%',
      opacity: 0 // Start invisible
    },
    to: { 
      backgroundPosition: '100% 50%',
      opacity: !showLandingPage ? 1 : 0 // Only show once landing page is gone
    },
    config: { 
      duration: 1000, // Long duration for gradient movement
      opacity: { duration: 200 } // Even faster fade-in than in transitions.js
    },
    loop: { reverse: true },
    delay: 10 // Minimal delay to ensure immediate visibility
  });
  
  // Determine if component should render with proper timing
  const shouldRender = isReady && !showShopManagement && !currentUser;
  
  // Make sure TopBar is visible when showing the login form
  useEffect(() => {
    if (shouldRender) {
      setShowTopBar(true);
    }
  }, [shouldRender, setShowTopBar]);
  
  // Reset the exit animation state when the component mounts or visibility changes
  useEffect(() => {
    if (shouldRender) {
      setIsExiting(false);
    }
  }, [shouldRender]);
  
  useEffect(() => {
    // If the form is no longer needed but hasn't started exiting yet
    if (!shouldRender && !isExiting && isReady) {
      setIsExiting(true);
    }
  }, [shouldRender, isExiting, isReady]);
  
  // ⚡ UPDATE: Enhanced form transition with faster animation timing
  const formTransition = useTransition(shouldRender && !isExiting, {
    from: {
      ...formAnimation.from,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    enter: {
      ...formAnimation.enter,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 1, // Force to 1 immediately for faster appearance
    },
    leave: {
      ...formAnimation.leave,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    config: {
      mass: 1,
      tension: 380, // Higher tension for faster animation
      friction: 18,  // Lower friction for faster animation
      duration: 150, // Even shorter duration than in transitions.js
    },
    onRest: () => {
      if (isExiting) {
        setIsExiting(false);
      }
    }
  });
  
  if (showShopManagement || currentUser) {
    return <ShopManagement />;
  }
  
  // ⚡ UPDATE: Immediate render approach for faster appearance
  return (
    <>
      {formTransition((style, show) => 
        show && (
          <animated.div 
            className={styles.container} 
            style={{
              ...style,
              ...gradientProps,
              willChange: 'opacity, transform', // Performance optimization
            }}
          >
            <div className={styles.formContainer}>
              <FormContent />
            </div>
          </animated.div>
        )
      )}
    </>
  );
};

export default LoginRegisterForm;