import React, { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/ErrorCard.module.css';
import { CircleX } from 'lucide-react';

const ErrorCard = () => {
  // 🔄 UPDATE: Added state to track the most recent error message
  const [latestError, setLatestError] = useState('');
  
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
      setShowErrorCard(false);
      setLatestError('');
    } else {
      // 🔄 UPDATE: Find the latest error message (assuming the last non-empty one is newest)
      const mostRecentError = errorEntries[errorEntries.length - 1][1];
      setLatestError(mostRecentError);
      setShowErrorCard(true);
      
      const timer = setTimeout(() => {
        setShowErrorCard(false);
        // Clear all errors after the timeout
        clearError();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [error, setShowErrorCard, clearError]);

  return (
    showErrorCard && latestError && (
      <div className={styles.container}>
        <CircleX color="red" size={24} />
        <div className={styles.errorList}>
          {/* 🔄 UPDATE: Only display the latest error message */}
          <div className={styles.errorItem}>
            {latestError}
          </div>
        </div>
      </div>
    )
  );
};

export default ErrorCard;