import { useEffect, useState } from 'react';
import styles from '../../../../public/css/CardDisplay.module.css';
import ErrorCard from '../card_display/components/error_card/ErrorCard.jsx';
import SuccessCard from '../card_display/components/success_card/SuccessCard.jsx';
import InfoCard from '../card_display/components/info_card/InfoCard.jsx';
import ImageModal from '../image_modal/ImageModal.jsx';
import { useUI } from '../../app_context/UIContext.jsx';

// ⭐ UPDATE: Enhanced implementation with background blur effect that lasts half as long as cards
function CardDisplay() {
  // State for card visibility with CSS classes
  const [errorCardClass, setErrorCardClass] = useState(styles.cardContainer);
  const [successCardClass, setSuccessCardClass] = useState(styles.cardContainer);
  const [infoCardClass, setInfoCardClass] = useState(styles.cardContainer);
  
  // ⭐ UPDATE: Added blur overlay state
  const [blurClass, setBlurClass] = useState(styles.blurOverlay);
  
  // State to track if cards are being animated
  const [isErrorAnimating, setIsErrorAnimating] = useState(false);
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);
  const [isInfoAnimating, setIsInfoAnimating] = useState(false);
  
  // Using useUI hook to access card states
  const {
    error,
    success,
    info,
    showImageModal,
    showErrorCard,
    showSuccessCard, 
    showInfoCard,
    setShowErrorCard,
    setShowSuccessCard,
    setShowInfoCard,
    clearError,
    clearSuccess,
    clearInfo
  } = useUI();
  
  // Helper function to check if an object has any non-empty values
  const hasAnyValue = (obj) => {
    return obj && Object.values(obj).some(value => value);
  };
  
  // Helper function for error card animation with half-time blur
  const animateErrorCard = () => {
    if (isErrorAnimating) return;
    setIsErrorAnimating(true);
    
    // Show card with animation
    setErrorCardClass(`${styles.cardContainer} ${styles.cardVisible}`);
    
    // ⭐ UPDATE: Activate blur effect
    setBlurClass(`${styles.blurOverlay} ${styles.blurActive}`);
    
    // ⭐ UPDATE: Remove blur after half the time (2 seconds)
    setTimeout(() => {
      setBlurClass(styles.blurOverlay);
    }, 2000);
    
    // After 4 seconds, hide with animation
    const timer = setTimeout(() => {
      setErrorCardClass(`${styles.cardContainer} ${styles.cardHiding}`);
      
      // After animation completes, reset state
      setTimeout(() => {
        setShowErrorCard(false);
        clearError();
        setIsErrorAnimating(false);
        setErrorCardClass(styles.cardContainer);
      }, 300); // Duration matches CSS transition
    }, 4000); // Display duration
    
    return () => clearTimeout(timer);
  };
  
  // Helper function for success card animation with half-time blur
  const animateSuccessCard = () => {
    if (isSuccessAnimating) return;
    setIsSuccessAnimating(true);
    
    // Show card with animation
    setSuccessCardClass(`${styles.cardContainer} ${styles.cardVisible}`);
    
    // ⭐ UPDATE: Activate blur effect
    setBlurClass(`${styles.blurOverlay} ${styles.blurActive}`);
    
    // ⭐ UPDATE: Remove blur after half the time (2 seconds)
    setTimeout(() => {
      setBlurClass(styles.blurOverlay);
    }, 2000);
    
    // After 4 seconds, hide with animation
    const timer = setTimeout(() => {
      setSuccessCardClass(`${styles.cardContainer} ${styles.cardHiding}`);
      
      // After animation completes, reset state
      setTimeout(() => {
        setShowSuccessCard(false);
        clearSuccess();
        setIsSuccessAnimating(false);
        setSuccessCardClass(styles.cardContainer);
      }, 300); // Duration matches CSS transition
    }, 4000); // Display duration
    
    return () => clearTimeout(timer);
  };
  
  // Helper function for info card animation with half-time blur
  const animateInfoCard = () => {
    if (isInfoAnimating) return;
    setIsInfoAnimating(true);
    
    // Show card with animation
    setInfoCardClass(`${styles.cardContainer} ${styles.cardVisible}`);
    
    // ⭐ UPDATE: Activate blur effect
    setBlurClass(`${styles.blurOverlay} ${styles.blurActive}`);
    
    // ⭐ UPDATE: Remove blur after half the time (2 seconds)
    setTimeout(() => {
      setBlurClass(styles.blurOverlay);
    }, 2000);
    
    // After 4 seconds, hide with animation
    const timer = setTimeout(() => {
      setInfoCardClass(`${styles.cardContainer} ${styles.cardHiding}`);
      
      // After animation completes, reset state
      setTimeout(() => {
        setShowInfoCard(false);
        clearInfo();
        setIsInfoAnimating(false);
        setInfoCardClass(styles.cardContainer);
      }, 300); // Duration matches CSS transition
    }, 4000); // Display duration
    
    return () => clearTimeout(timer);
  };
  
  // Effect to handle error card display
  useEffect(() => {
    if (showErrorCard && hasAnyValue(error) && !isErrorAnimating) {
      animateErrorCard();
    }
  }, [showErrorCard, error, isErrorAnimating]);
  
  // Effect to handle success card display
  useEffect(() => {
    if (showSuccessCard && hasAnyValue(success) && !isSuccessAnimating) {
      animateSuccessCard();
    }
  }, [showSuccessCard, success, isSuccessAnimating]);
  
  // Effect to handle info card display
  useEffect(() => {
    if (showInfoCard && hasAnyValue(info) && !isInfoAnimating) {
      animateInfoCard();
    }
  }, [showInfoCard, info, isInfoAnimating]);
  
  // Effect to detect new error messages
  useEffect(() => {
    if (error && hasAnyValue(error) && !showErrorCard && !isErrorAnimating) {
      setShowErrorCard(true);
    }
  }, [error, showErrorCard, isErrorAnimating, setShowErrorCard]);
  
  // Effect to detect new success messages
  useEffect(() => {
    if (success && hasAnyValue(success) && !showSuccessCard && !isSuccessAnimating) {
      setShowSuccessCard(true);
    }
  }, [success, showSuccessCard, isSuccessAnimating, setShowSuccessCard]);
  
  // Effect to detect new info messages
  useEffect(() => {
    if (info && hasAnyValue(info) && !showInfoCard && !isInfoAnimating) {
      setShowInfoCard(true);
    }
  }, [info, showInfoCard, isInfoAnimating, setShowInfoCard]);

  return (
    <>
      {/* Blur overlay element */}
      <div className={blurClass}></div>
      
      <div className={styles.cardDisplayContainer}>
        {showImageModal && <ImageModal />}
        
        {/* Dedicated container for all notification cards */}
        <div className={styles.messageWrapper}>
          {/* Error card with CSS transition animation */}
          {showErrorCard && hasAnyValue(error) && (
            <div className={errorCardClass}>
              <ErrorCard />
            </div>
          )}
          
          {/* Success card with CSS transition animation */}
          {showSuccessCard && hasAnyValue(success) && (
            <div className={successCardClass}>
              <SuccessCard />
            </div>
          )}
          
          {/* Info card with CSS transition animation */}
          {showInfoCard && hasAnyValue(info) && (
            <div className={infoCardClass}>
              <InfoCard />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CardDisplay;