import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import LandingPage from "../landing_page/LandingPage.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import { formAnimation } from '../../utils/animation/transitions.js';
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
  const { showShopManagement, showLandingPage, setShowLandingPage } = useUI();
  
  // ✨ UPDATE: Using a single isExiting flag for animation control - same approach as ShopCreationForm
  const [isExiting, setIsExiting] = useState(false);
  
  // Handler to proceed from landing to login/register form
  const handleProceedToLogin = () => {
    setShowLandingPage(false);
  };
  
  // Determine what to show based on current application state
  const showLoginForm = !showLandingPage && !showShopManagement && !currentUser;
  
  // Reset the exit animation state when the component mounts or visibility changes
  useEffect(() => {
    if (showLoginForm) {
      setIsExiting(false);
    }
  }, [showLoginForm]);
  
  // ✨ UPDATE: Function to handle closing the form with animation - matches ShopCreationForm
  const handleCloseForm = (callback) => {
    setIsExiting(true);
    setTimeout(() => {
      if (callback) callback();
    }, 500); // Same timing as ShopCreationForm
  };
  
  // ✨ UPDATE: Add listener for authentication state changes to trigger exit animation
  useEffect(() => {
    // If the form is no longer needed but hasn't started exiting yet
    if (!showLoginForm && !isExiting) {
      setIsExiting(true);
    }
  }, [showLoginForm, isExiting]);
  
  // ✨ UPDATE: Form transition using the exact same pattern as ShopCreationForm
  const formTransition = useTransition(showLoginForm && !isExiting, {
    from: formAnimation.from,
    enter: formAnimation.enter,
    leave: formAnimation.leave,
    config: formAnimation.config,
    onRest: () => {
      // Animation has completed - same cleanup as ShopCreationForm
      if (isExiting) {
        setIsExiting(false);
      }
    }
  });
  
  // Handle what to render based on current state
  if (showShopManagement || currentUser) {
    const userType = currentUser?.type_user || type_user;
    return userType === 'seller' ? <ShopManagement /> : <LandingPage />;
  }
  
  if (showLandingPage) {
    return <LandingPage onProceedToLogin={handleProceedToLogin} />;
  }
  
  // Render login form with animation - exactly matching ShopCreationForm's approach
  return (
    <>
      {formTransition((style, show) => 
        show && (
          <animated.div 
            className={styles.container} 
            style={style}
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