import React, { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/ErrorCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleX } from 'lucide-react'; // 🚨 UPDATE: Imported MessageCircleX icon from lucide-react

const ErrorCard = () => {
  // State to track the most recent error message
  const [latestError, setLatestError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    showErrorCard, 
    setShowErrorCard,
    error,
    clearError
  } = useUI();

  useEffect(() => {
    const errorEntries = Object.entries(error).filter(([_, value]) => value !== '');
    const hasErrors = errorEntries.length > 0;
    
    if (!hasErrors) {
      setIsVisible(false);
      setTimeout(() => {
        setShowErrorCard(false);
        setLatestError('');
      }, 400); // Matching the animation duration
    } else {
      // Find the latest error message (assuming the last non-empty one is newest)
      const mostRecentError = errorEntries[errorEntries.length - 1][1];
      setLatestError(mostRecentError);
      setShowErrorCard(true);
      
      // Small delay before showing to ensure animation runs properly
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      
      const timer = setTimeout(() => {
        // First hide the card with animation
        setIsVisible(false);
        // Then clear the error after animation completes
        setTimeout(() => {
          setShowErrorCard(false);
          clearError();
        }, 400); // Matching the animation duration
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [error, setShowErrorCard, clearError]);

  // Added container style based on visibility
  const containerStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
  };

  return (
    showErrorCard && latestError && (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.iconContainer}>
          <div className={styles.iconOverlay}>
            <MessageCircleX size={18} color="#cf1322" />
          </div>
          <OButton 
            size="extraSmall" 
            text="O" 
            ariaLabel="Error indicator" 
            className={styles.errorButton}
            onClick={() => {}}
          />
        </div>
        <div className={styles.errorList}>
          <div className={styles.errorItem}>
            {latestError}
          </div>
        </div>
      </div>
    )
  );
};

export default ErrorCard;