import React, { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/SuccessCard.module.css';
import { CircleCheckBig } from 'lucide-react';

const SuccessCard = () => {
  // 🔄 UPDATE: Added state to track the most recent success message
  const [latestSuccess, setLatestSuccess] = useState('');
  
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
      setShowSuccessCard(false);
      setLatestSuccess('');
    } else {
      // 🔄 UPDATE: Find the latest success message
      const mostRecentSuccess = successEntries[successEntries.length - 1][1];
      setLatestSuccess(mostRecentSuccess);
      setShowSuccessCard(true);
      
      const timer = setTimeout(() => {
        setShowSuccessCard(false);
        // Clear all success messages after the timeout
        clearSuccess();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [success, setShowSuccessCard, clearSuccess]);

  return (
    showSuccessCard && latestSuccess && (
      <div className={styles.container}>
        <CircleCheckBig color="var(--saturated-orange)" size={20} />
        <div className={styles.successList}>
          {/* 🔄 UPDATE: Only display the latest success message */}
          <div className={styles.successItem}>
            {latestSuccess}
          </div>
        </div>
      </div>
    )
  );
};

export default SuccessCard;