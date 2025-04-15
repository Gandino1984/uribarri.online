import React, { useEffect } from 'react';
import styles from '../../../../public/css/CardDisplay.module.css';
import { CardDisplayUtils } from './CardDisplayUtils.jsx';
import ErrorCard from '../card_display/components/error_card/ErrorCard.jsx';
import SuccessCard from '../card_display/components/success_card/SuccessCard.jsx';
import InfoCard from '../card_display/components/info_card/InfoCard.jsx';
import ImageModal from '../image_modal/ImageModal.jsx';
import { useUI } from '../../app_context/UIContext.jsx';

// 🎴 UPDATE: Enhanced CardDisplay component to work with updated card designs
function CardDisplay() {
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
    setShowInfoCard
  } = useUI();
  
  const utils = CardDisplayUtils();
  
  // Auto-hide cards after specified durations
  useEffect(() => {
    if (error && Object.keys(error).some(key => error[key]) && !showErrorCard) {
      setShowErrorCard(true);
      if (utils && typeof utils.autoHideCards === 'function') {
        utils.autoHideCards('error');
      }
    }
    
    if (success && Object.keys(success).some(key => success[key]) && !showSuccessCard) {
      setShowSuccessCard(true);
      if (utils && typeof utils.autoHideCards === 'function') {
        utils.autoHideCards('success');
      }
    }
    
    if (info && Object.keys(info).some(key => info[key]) && !showInfoCard) {
      setShowInfoCard(true);
      if (utils && typeof utils.autoHideCards === 'function') {
        utils.autoHideCards('info');
      }
    }
  }, [error, success, info, utils, showErrorCard, showSuccessCard, showInfoCard, setShowErrorCard, setShowSuccessCard, setShowInfoCard]);

  // Helper function to check if an object has any non-empty values
  const hasAnyValue = (obj) => {
    return obj && Object.values(obj).some(value => value);
  };

  return (
    <div className={styles.cardDisplayContainer}>
      {showImageModal && <ImageModal />}
      
      {/* Dedicated container for all notification cards */}
      <div className={styles.messageWrapper}>
          {showErrorCard && hasAnyValue(error) && 
            <div className={styles.cardEnterAnimation}>
              <ErrorCard />
            </div>
          }
          
          {showSuccessCard && hasAnyValue(success) && 
            <div className={styles.cardEnterAnimation}>
              <SuccessCard />
            </div>
          }
          
          {showInfoCard && hasAnyValue(info) && 
            <div className={styles.cardEnterAnimation}>
              <InfoCard />
            </div>
          }
      </div>
    </div>
  );
}

export default CardDisplay;