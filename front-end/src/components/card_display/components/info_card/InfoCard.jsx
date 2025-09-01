import { useEffect, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/InfoCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleWarning, KeyRound, Store } from 'lucide-react';

const InfoCard = () => {
  // State to track the most recent info message
  const [latestInfo, setLatestInfo] = useState('');
  // 🔧 UPDATE: Added state to track the type of info message for different icons
  const [infoType, setInfoType] = useState('general');
  
  const {
    isLoggingIn,
    showRepeatPasswordMessage,
    showPasswordRepeat
  } = useAuth();

  const {
    info,
  } = useUI();

  // Determine if we should show the password repeat message
  const shouldShowPasswordMessage = !isLoggingIn && showRepeatPasswordMessage && showPasswordRepeat;

  useEffect(() => {
    const infoEntries = Object.entries(info).filter(([, value]) => value !== '');
    const hasInfo = infoEntries.length > 0;
    
    if (!hasInfo) {
      setLatestInfo('');
      setInfoType('general');
    } else {
      // Find the latest info message
      const mostRecentInfo = infoEntries[infoEntries.length - 1];
      const [key, value] = mostRecentInfo;
      setLatestInfo(value);
      
      // 🔧 UPDATE: Set info type based on the key to show appropriate icon
      if (key === 'shopInstructions') {
        setInfoType('shop');
      } else {
        setInfoType('general');
      }
    }
  }, [info]);

  // Don't render anything if there's nothing to show
  if (!shouldShowPasswordMessage && !latestInfo) {
    return null;
  }

  // 🔧 UPDATE: Function to get appropriate icon based on info type
  const getInfoIcon = () => {
    switch (infoType) {
      case 'shop':
        return <Store size={18} color="#F59925" />;
      default:
        return <MessageCircleWarning size={18} color="#F59925" />;
    }
  };

  return (
    <div className={styles.container}>
      {shouldShowPasswordMessage ? (
        <>
          {/* <div className={styles.iconContainer}>
            <div className={styles.iconOverlay}>
              <KeyRound size={18} color="var(--saturated-orange)" />
            </div>
            <OButton 
              size="extraSmall" 
              text="O" 
              ariaLabel="Password confirmation" 
              className={styles.infoButton}
              onClick={() => {}}
            />
          </div> */}
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              Confirma la contraseña
            </div>
          </div>
        </>
      ) : (
        latestInfo && (
          <>
            {/* <div className={styles.iconContainer}>
              <OButton 
                size="extraSmall" 
                text="O" 
                ariaLabel="Info indicator" 
                className={styles.infoButton}
                onClick={() => {}}
              />
            </div> */}
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                {latestInfo}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default InfoCard;