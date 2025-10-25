import { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../css/ErrorCard.module.css';
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
      //update: Prioritize specific errors over generic ones
      const errorPriority = [
        'userTypeError',       // Specific user type change errors
        'emailError',          // Email-specific errors
        'userError',           // User-specific errors
        'userlocationError',   // Location errors
        'ipError',             // IP validation errors
        'databaseResponseError', // Generic database errors (lowest priority)
      ];

      // Find the highest priority error that has a value
      let selectedError = '';
      for (const errorKey of errorPriority) {
        const foundError = errorEntries.find(([key]) => key === errorKey);
        if (foundError && foundError[1]) {
          selectedError = foundError[1];
          break;
        }
      }

      // If no prioritized error found, use the last one
      if (!selectedError && errorEntries.length > 0) {
        selectedError = errorEntries[errorEntries.length - 1][1];
      }

      setLatestError(selectedError);
    }
  }, [error]);

  return (
    latestError && (
      <div className={styles.container}>
        {/* <div className={styles.iconContainer}>
          <OButton 
            size="extraSmall" 
            text="O" 
            ariaLabel="Error indicator" 
            className={styles.errorButton}
            onClick={() => {}}
          />
        </div> */}
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