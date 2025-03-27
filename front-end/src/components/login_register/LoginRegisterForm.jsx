import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import LandingPage from "../landing_page/LandingPage.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import { loginFormAnimation } from '../../utils/animation/transitions.js';
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
  
  // 🌟 UPDATE: Simplified component state management
  const [isExiting, setIsExiting] = useState(false);
  
  // Handler to proceed from landing to login/register form
  const handleProceedToLogin = () => {
    setShowLandingPage(false);
  };
  
  // 🌟 UPDATE: Determine what to show based on current application state
  const showLoginForm = !showLandingPage && !showShopManagement && !currentUser;
  
  // 🌟 UPDATE: Track when we need to start an exit animation
  useEffect(() => {
    // Reset exit animation state when component state changes
    setIsExiting(false);
  }, [showLoginForm]);
  
  // 🌟 UPDATE: Prepare exit animation when user logs in
  const prepareExit = () => {
    if (showLoginForm) {
      setIsExiting(true);
    }
  };
  
  // Add listeners to start exit animations when user logs in or navigates
  useEffect(() => {
    // Listen for authentication state changes
    if (!showLoginForm && !isExiting) {
      prepareExit();
    }
  }, [showLoginForm, isExiting]);
  
  // 🌟 UPDATE: Transition for login form animation
  const formTransition = useTransition(showLoginForm && !isExiting, {
    from: loginFormAnimation.from,
    enter: loginFormAnimation.enter,
    leave: loginFormAnimation.leave,
    config: loginFormAnimation.config,
    onRest: () => {
      // Animation has completed
      setIsExiting(false);
    }
  });
  
  // Handle component rendering logic
  if (showShopManagement || currentUser) {
    const userType = currentUser?.type_user || type_user;
    return userType === 'seller' ? <ShopManagement /> : <LandingPage />;
  }
  
  if (showLandingPage) {
    return <LandingPage onProceedToLogin={handleProceedToLogin} />;
  }
  
  // Render login form with animation when neither of the above conditions are met
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