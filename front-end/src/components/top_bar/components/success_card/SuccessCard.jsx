import React, { useEffect } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/SuccessCard.module.css';
import { CircleCheckBig } from 'lucide-react';

const SuccessCard = () => {
  // UPDATE: Using useUI hook instead of AppContext
  const {
    showSuccessCard,
    setShowSuccessCard,
    success,
  } = useUI();

  useEffect(() => {
    const hasSuccess = Object.values(success).some(msg => msg !== '');
    
    if (!hasSuccess) {
      setShowSuccessCard(false);
    } else {
      setShowSuccessCard(true);
      
      const timer = setTimeout(() => {
        setShowSuccessCard(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [success, setShowSuccessCard]);

  const activeSuccessMessages = Object.entries(success).filter(([_, value]) => value !== '');

  return (
    showSuccessCard && activeSuccessMessages.length > 0 && (
      <div className={styles.container}>
        <CircleCheckBig color="var(--saturated-orange)" size={20} />

        <div className={styles.successList}>
          {activeSuccessMessages.map(([key, value]) => (
            <div className={styles.successItem} key={key}>
              {value}
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default SuccessCard;