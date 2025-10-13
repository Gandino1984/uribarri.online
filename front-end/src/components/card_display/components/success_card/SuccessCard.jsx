import { useEffect, useState } from 'react';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../public/css/SuccessCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleHeart } from 'lucide-react';

const SuccessCard = () => {
  // State to track the most recent success message
  const [latestSuccess, setLatestSuccess] = useState('');
  
  const {
    success,
  } = useUI();

  useEffect(() => {
    const successEntries = Object.entries(success).filter(([, value]) => value !== '');
    const hasSuccess = successEntries.length > 0;
    
    if (!hasSuccess) {
      setLatestSuccess('');
    } else {
      // Find the latest success message (assuming the last non-empty one is newest)
      const mostRecentSuccess = successEntries[successEntries.length - 1][1];
      setLatestSuccess(mostRecentSuccess);
    }
  }, [success]);

  // ✨ UPDATE: No longer managing visibility or animations here - it's handled by the parent using React Spring

  return (
    latestSuccess && (
      <div className={styles.container}>
        {/* <div className={styles.iconContainer}>
          <OButton 
            size="extraSmall" 
            text="O" 
            ariaLabel="Success indicator" 
            className={styles.successButton}
            onClick={() => {}}
          />
        </div> */}
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