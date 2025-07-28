import React, { useState, useEffect, useCallback } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import styles from '../../../../public/css/LoginRegisterForm.module.css';

// Memoize form content
const FormContent = React.memo(() => {
  //update: Import isLoggingIn from AuthContext to determine which title to show
  const { isLoggingIn } = useAuth();
  
  return (
    <div className={styles.formContentWrapper}>
      <h1 className={styles.formTitle}>
        {isLoggingIn ? '¡Transforma el barrio!' : '¡Crea tu usuari@!'}
      </h1>
      <FormActions />
      <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
        <FormFields />
        <KeyboardSection />
      </form>
    </div>
  );
});

FormContent.displayName = 'FormContent';

const LoginRegisterForm = () => {
  const { currentUser } = useAuth();
  const { 
    showShopManagement, 
    showLandingPage,
    setShowTopBar  
  } = useUI();
  
  // Track if mounted, not animation state
  const [isMounted, setIsMounted] = useState(false);
  
  // Simple state to track if we should show content
  const shouldShow = !showLandingPage && !showShopManagement && !currentUser;
  
  // Show TopBar when form is visible
  useEffect(() => {
    if (shouldShow && !isMounted) {
      setShowTopBar(true);
      setIsMounted(true);
    }
  }, [shouldShow, setShowTopBar, isMounted]);
  

  const getTransition = useCallback(() => {
    return {
      from: { opacity: 0, transform: 'translateY(10px)' },
      enter: { opacity: 1, transform: 'translateY(0px)' },
      leave: { opacity: 0, transform: 'translateY(-10px)' },
      config: { tension: 280, friction: 20 },
    };
  }, []);
  
  const transitions = useTransition(shouldShow, getTransition());
  
  // Return ShopManagement if we should show it instead
  if (showShopManagement || currentUser) {
    return <ShopManagement />;
  }
  
  // Clean, simple render without extra animations that might loop
  return transitions((style, item) => 
    item && (
      <animated.div 
        className={styles.container} 
        style={style}
      >
        <div className={styles.formContainer}>
          <FormContent />
        </div>
      </animated.div>
    )
  );
};

export default LoginRegisterForm;