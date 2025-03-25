import React, { useEffect } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/ErrorCard.module.css';
import { CircleX } from 'lucide-react';

const ErrorCard = () => {
  // UPDATE: Using useUI hook instead of AppContext
  const {
    showErrorCard, 
    setShowErrorCard,
    error,
  } = useUI();

  useEffect(() => {
    const hasErrors = Object.values(error).some(err => err !== '');
    
    if (!hasErrors) {
      setShowErrorCard(false);
    } else {
      setShowErrorCard(true);
      
      const timer = setTimeout(() => {
        setShowErrorCard(false);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [error, setShowErrorCard]);

  // Only render errors that actually have a message
  const activeErrors = Object.entries(error).filter(([_, value]) => value !== '');

  return (
    showErrorCard && activeErrors.length > 0 && (
      <div className={styles.container}>
        <CircleX color="red" size={24} />
        <div className={styles.errorList}>
          {activeErrors.map(([key, value]) => (
            <div className={styles.errorItem} key={key}>
              {value}
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default ErrorCard;