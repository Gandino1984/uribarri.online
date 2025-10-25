//update: Fixed forgot password navigation to use UIContext instead of window.location.href
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
import { ArrowLeft, KeyRound } from 'lucide-react';
import styles from '../../../css/LoginRegisterForm.module.css';
//update: Import FloatingVideoButton for contextual help
import FloatingVideoButton from '../video_tutorial/FloatingVideoButton.jsx';
import VideoTutorialModal from '../video_tutorial/VideoTutorialModal.jsx';

// Memoize form content
const FormContent = React.memo(({ onForgotPassword }) => {
  const { isLoggingIn } = useAuth();
  
  return (
    <div className={styles.formContentWrapper}>
      <h1 className={styles.formTitle}>
        {isLoggingIn ? 'Inicia sesión' : 'Crea tu usuari@ aquí.'}
      </h1>
      <FormActions />
      <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formFieldsWrapper}>
          <FormFields />  
          
          {/*update: Add "Forgot Password?" link only when logging in*/}
          {isLoggingIn && (
            <button
              type="button"
              onClick={onForgotPassword}
              className={styles.forgotPasswordLink}
            >
              {/* <KeyRound size={16} /> */}
              <span>¿Olvidaste tu contraseña?</span>
            </button>
          )}
        </div>
        
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
    setShowLandingPage,
    setNavigationIntent,
    setShowInfoManagement,
    setShowShopsListBySeller,
    setShowRiderManagement,
    setShowShopManagement,
    setShowShopStore,
    setShowShopWindow,
    //update: Get forgot password state setter
    setShowForgotPassword,
    //update: Get video tutorial modal state
    showVideoTutorialModal,
    currentVideoUrl,
    currentVideoTitle,
    closeVideoTutorial
  } = useUI();
  
  const [isMounted, setIsMounted] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  const shouldShow = !showLandingPage && !showShopManagement && !currentUser && !showShopStore && !showShopWindow && !showVerificationPending;
  
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

  const handleBackToLanding = useCallback(() => {
    console.log('Navigating back to LandingPage from LoginRegisterForm');
    
    setNavigationIntent(null);
    localStorage.removeItem('navigationIntent');
    
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

  //update: Handler for forgot password navigation using UIContext
  const handleForgotPassword = useCallback(() => {
    console.log('Navigating to ForgotPassword page');
    
    // Update URL without page reload
    window.history.pushState({}, '', '/forgot-password');
    
    // Hide all other views
    setShowLandingPage(false);
    setShowShopManagement(false);
    setShowShopStore(false);
    setShowShopWindow(false);
    setShowInfoManagement(false);
    setShowShopsListBySeller(false);
    setShowRiderManagement(false);
    setShowTopBar(false);
    
    // Show forgot password view
    setShowForgotPassword(true);
  }, [
    setShowForgotPassword,
    setShowLandingPage,
    setShowShopManagement,
    setShowShopStore,
    setShowShopWindow,
    setShowInfoManagement,
    setShowShopsListBySeller,
    setShowRiderManagement,
    setShowTopBar
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
  
  if (showVerificationPending && pendingEmail) {
    return <EmailVerificationPending email={pendingEmail} onBackToLogin={handleBackToLogin} />;
  }
  
  if (showShopStore) {
    return <ShopStore />;
  }
  
  if (showShopManagement || currentUser) {
    return <ShopManagement />;
  }
  
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
          </button>

          <FormContent onForgotPassword={handleForgotPassword} />
        </div>

        {/*update: Add floating video help button for login/register context*/}
        <FloatingVideoButton context="loginRegister" position="bottom-right" />

        {/*update: Add VideoTutorialModal (controlled by UIContext)*/}
        <VideoTutorialModal
          isOpen={showVideoTutorialModal}
          onClose={closeVideoTutorial}
          videoUrl={currentVideoUrl}
          title={currentVideoTitle}
        />
      </animated.div>
    )
  );
};

export default LoginRegisterForm;