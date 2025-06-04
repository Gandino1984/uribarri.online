import { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/ErrorCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleX } from 'lucide-react'; 

const ErrorCard = () => {
  // State to track the most recent error message
  const [latestError, setLatestError] = useState('');
  
  const { 
    error
  } = useUI();

  useEffect(() => {
    const errorEntries = Object.entries(error).filter(([, value]) => value !== '');
    const hasErrors = errorEntries.length > 0;
    
    if (!hasErrors) {
      setLatestError('');
    } else {
      // Find the latest error message (assuming the last non-empty one is newest)
      const mostRecentError = errorEntries[errorEntries.length - 1][1];
      setLatestError(mostRecentError);
    }
  }, [error]);

  return (
    latestError && (
      <div className={styles.container}>
        <div className={styles.iconContainer}>
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