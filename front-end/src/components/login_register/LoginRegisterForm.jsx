import React, { useState, useEffect, useCallback } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import ShopStore from "../shop_store/ShopStore.jsx";
import EmailVerificationPending from "../email_verification/EmailVerificationPending.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
//update: Import ArrowLeft icon for back button
import { ArrowLeft } from 'lucide-react';
import styles from '../../../css/LoginRegisterForm.module.css';

// Memoize form content
const FormContent = React.memo(() => {
  const { isLoggingIn } = useAuth();
  
  return (
    <div className={styles.formContentWrapper}>
      <h1 className={styles.formTitle}>
        {isLoggingIn ? 'Inicia sesión' : 'Crea tu usuari@ aquí.'}
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
  const { currentUser, email_user } = useAuth();
  const { 
    showShopManagement, 
    showLandingPage,
    setShowTopBar,
    showShopStore,
    showShopWindow,
    success,
    //update: Import navigation functions for back button
    setShowLandingPage,
    setNavigationIntent,
    setShowInfoManagement,
    setShowShopsListBySeller,
    setShowRiderManagement,
    setShowShopManagement,
    setShowShopStore,
    setShowShopWindow
  } = useUI();
  
  // Track if mounted, not animation state
  const [isMounted, setIsMounted] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Simple state to track if we should show content
  const shouldShow = !showLandingPage && !showShopManagement && !currentUser && !showShopStore && !showShopWindow && !showVerificationPending;
  
  // Show TopBar when form is visible
  useEffect(() => {
    if (shouldShow && !isMounted) {
      setShowTopBar(true);
      setIsMounted(true);
    }
  }, [shouldShow, setShowTopBar, isMounted]);
  
  useEffect(() => {
    if (success?.registrationSuccess && email_user) {
      console.log('Registration successful, showing verification pending screen');
      setPendingEmail(email_user);
      setShowVerificationPending(true);
    }
  }, [success, email_user]);

  //update: Handler for back to landing page
  const handleBackToLanding = useCallback(() => {
    console.log('Navigating back to LandingPage from LoginRegisterForm');
    
    // Clear navigation intent
    setNavigationIntent(null);
    localStorage.removeItem('navigationIntent');
    
    // Reset all navigation states
    setShowLandingPage(true);
    setShowTopBar(false);
    setShowShopManagement(false);
    setShowShopStore(false);
    setShowShopWindow(false);
    setShowInfoManagement(false);
    setShowShopsListBySeller(false);
    setShowRiderManagement(false);
    
    console.log('Successfully navigated to LandingPage');
  }, [
    setShowLandingPage,
    setShowTopBar,
    setShowShopManagement,
    setShowShopStore,
    setShowShopWindow,
    setShowInfoManagement,
    setShowShopsListBySeller,
    setShowRiderManagement,
    setNavigationIntent
  ]);

  const getTransition = useCallback(() => {
    return {
      from: { opacity: 0, transform: 'translateY(10px)' },
      enter: { opacity: 1, transform: 'translateY(0px)' },
      leave: { opacity: 0, transform: 'translateY(-10px)' },
      config: { tension: 280, friction: 20 },
    };
  }, []);
  
  const transitions = useTransition(shouldShow, getTransition());
  
  const handleBackToLogin = useCallback(() => {
    setShowVerificationPending(false);
    setPendingEmail('');
  }, []);
  
  // Return appropriate component based on state
  if (showVerificationPending && pendingEmail) {
    return <EmailVerificationPending email={pendingEmail} onBackToLogin={handleBackToLogin} />;
  }
  
  if (showShopStore) {
    return <ShopStore />;
  }
  
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
          <button 
            onClick={handleBackToLanding}
            className={styles.backButton}
            title="Volver al inicio"
          >
            <ArrowLeft size={20} />
            <span>Volver al Inicio</span>
          </button>

          <FormContent />
        </div>
      </animated.div>
    )
  );
};

export default LoginRegisterForm;