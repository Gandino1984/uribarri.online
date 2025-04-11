import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
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
  const { 
    showShopManagement, 
    setShowLandingPage, // 💡 UPDATE: Keep this to potentially return to landing page
    setShowTopBar  
  } = useUI();
  
  const [isExiting, setIsExiting] = useState(false);
  
  
  // Determine what to show based on current application state
  const showLoginForm = !showShopManagement && !currentUser;
  
  // Reset the exit animation state when the component mounts or visibility changes
  useEffect(() => {
    if (showLoginForm) {
      setIsExiting(false);
    }
  }, [showLoginForm]);
  
  // const handleCloseForm = (callback) => {
  //   setIsExiting(true);
  //   setTimeout(() => {
  //     if (callback) callback();
  //   }, 500);
  // };
  
  useEffect(() => {
    // If the form is no longer needed but hasn't started exiting yet
    if (!showLoginForm && !isExiting) {
      setIsExiting(true);
    }
  }, [showLoginForm, isExiting]);
  
  const formTransition = useTransition(showLoginForm && !isExiting, {
    from: formAnimation.from,
    enter: formAnimation.enter,
    leave: formAnimation.leave,
    config: formAnimation.config,
    onRest: () => {
      if (isExiting) {
        setIsExiting(false);
      }
    }
  });
  
  
  if (showShopManagement || currentUser) {
    return <ShopManagement />;
  }
  
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