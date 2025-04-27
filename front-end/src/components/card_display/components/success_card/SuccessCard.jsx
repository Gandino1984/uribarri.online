import React, { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/SuccessCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleHeart } from 'lucide-react'; // 🎉 UPDATE: Imported CheckCircle icon from lucide-react

const SuccessCard = () => {
  // State to track the most recent success message
  const [latestSuccess, setLatestSuccess] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    showSuccessCard, 
    setShowSuccessCard,
    success,
    clearSuccess
  } = useUI();

  useEffect(() => {
    const successEntries = Object.entries(success).filter(([_, value]) => value !== '');
    const hasSuccess = successEntries.length > 0;
    
    if (!hasSuccess) {
      setIsVisible(false);
      setTimeout(() => {
        setShowSuccessCard(false);
        setLatestSuccess('');
      }, 400); // Matching the animation duration
    } else {
      // Find the latest success message (assuming the last non-empty one is newest)
      const mostRecentSuccess = successEntries[successEntries.length - 1][1];
      setLatestSuccess(mostRecentSuccess);
      setShowSuccessCard(true);
      
      // Small delay before showing to ensure animation runs properly
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      
      const timer = setTimeout(() => {
        // First hide the card with animation
        setIsVisible(false);
        // Then clear the success after animation completes
        setTimeout(() => {
          setShowSuccessCard(false);
          clearSuccess();
        }, 400); // Matching the animation duration
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [success, setShowSuccessCard, clearSuccess]);

  // Added container style based on visibility
  const containerStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
  };

  return (
    showSuccessCard && latestSuccess && (
      <div className={styles.container} style={containerStyle}>
        <div className={styles.iconContainer}>
          <div className={styles.iconOverlay}>
            <MessageCircleHeart size={18} color="#52c41a" />
          </div>
          <OButton 
            size="extraSmall" 
            text="O" 
            ariaLabel="Success indicator" 
            className={styles.successButton}
            onClick={() => {}}
          />
        </div>
        <div className={styles.successList}>
          <div className={styles.successItem}>
            {latestSuccess}
          </div>
        </div>
      </div>
    )
  );
};

export default SuccessCard;