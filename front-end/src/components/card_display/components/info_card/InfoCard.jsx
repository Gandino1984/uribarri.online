import { useEffect, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/InfoCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleWarning, KeyRound } from 'lucide-react';

const InfoCard = () => {
  // State to track the most recent info message
  const [latestInfo, setLatestInfo] = useState('');
  
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
    } else {
      // Find the latest info message
      const mostRecentInfo = infoEntries[infoEntries.length - 1][1];
      setLatestInfo(mostRecentInfo);
    }
  }, [info]);

  // ✨ UPDATE: No longer managing visibility or animations here - it's handled by the parent using React Spring

  // Don't render anything if there's nothing to show
  if (!shouldShowPasswordMessage && !latestInfo) {
    return null;
  }

  return (
    <div className={styles.container}>
      {shouldShowPasswordMessage ? (
        <div className={styles.passwordMessageContainer}>
          <div className={styles.iconContainer}>
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
          </div>
          <div className={styles.repeatPasswordMessage}>
            Confirma la contraseña
          </div>
        </div>
      ) : (
        latestInfo && (
          <>
            <div className={styles.iconContainer}>
              <div className={styles.iconOverlay}>
                <MessageCircleWarning size={18} color="#F59925" />
              </div>
              <OButton 
                size="extraSmall" 
                text="O" 
                ariaLabel="Info indicator" 
                className={styles.infoButton}
                onClick={() => {}}
              />
            </div>
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