import React, { useState, useEffect } from 'react';
import { useTransition, animated, useSpring } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import { loginRegisterFormAnimations } from '../../utils/animation/transitions.js';
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
  const { currentUser } = useAuth();
  const { 
    showShopManagement, 
    showLandingPage,
    setShowTopBar  
  } = useUI();
  
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Immediate readiness when landing page is gone
  useEffect(() => {
    if (!showLandingPage) {
      // Set ready state immediately when landing page is removed
      setIsReady(true);
    }
  }, [showLandingPage]);
  
  // Ultra-fast background gradient animation
  const gradientProps = useSpring({
    from: loginRegisterFormAnimations.gradientAnimation.from,
    to: { 
      ...loginRegisterFormAnimations.gradientAnimation.to,
      opacity: !showLandingPage ? 1 : 0 // Only show once landing page is gone
    },
    config: loginRegisterFormAnimations.gradientAnimation.config,
    loop: loginRegisterFormAnimations.gradientAnimation.loop,
    delay: loginRegisterFormAnimations.gradientAnimation.delay // No delay
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
  
  // Ultra-fast form animation with immediate opacity
  const formTransition = useTransition(shouldRender && !isExiting, {
    from: loginRegisterFormAnimations.formTransition.from,
    enter: {
      ...loginRegisterFormAnimations.formTransition.enter,
      opacity: 1, // Force to 1 immediately for instantly visible appearance
    },
    leave: loginRegisterFormAnimations.formTransition.leave,
    config: loginRegisterFormAnimations.formTransition.config,
    immediate: {
      opacity: true // Apply opacity change immediately without animation
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
  
  // The black gradient overlay is now added via CSS in LoginRegisterForm.module.css
  return (
    <>
      {formTransition((style, show) => 
        show && (
          <animated.div 
            className={styles.container} 
            style={{
              ...style,
              ...gradientProps,
              willChange: 'opacity, transform, background-position', // Performance optimization
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