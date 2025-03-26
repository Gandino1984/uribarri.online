import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/InfoCard.module.css';
import { MessageCircleWarning, KeyRound } from 'lucide-react';

const InfoCard = () => {
  // 🔄 UPDATE: Added state to track the most recent info message
  const [latestInfo, setLatestInfo] = useState('');
  
  const {
    isLoggingIn,
    showRepeatPasswordMessage,
    showPasswordRepeat
  } = useAuth();

  const {
    showInfoCard,
    setShowInfoCard,
    info,
    clearInfo
  } = useUI();

  // Determine if we should show the password repeat message
  const shouldShowPasswordMessage = !isLoggingIn && showRepeatPasswordMessage && showPasswordRepeat;

  useEffect(() => {
    const infoEntries = Object.entries(info).filter(([_, value]) => value !== '');
    const hasInfo = infoEntries.length > 0;
    
    // Only auto-hide the card if we're showing regular info messages
    // and not the password repeat message (which should stay visible until password is completed)
    if (!hasInfo && !shouldShowPasswordMessage) {
      setShowInfoCard(false);
      setLatestInfo('');
    } else if (hasInfo) {
      // 🔄 UPDATE: Find the latest info message
      const mostRecentInfo = infoEntries[infoEntries.length - 1][1];
      setLatestInfo(mostRecentInfo);
      setShowInfoCard(true);
      
      // Only set the timeout if we're not showing the password message
      if (!shouldShowPasswordMessage) {
        const timer = setTimeout(() => {
          setShowInfoCard(false);
          // Clear all info messages after the timeout
          clearInfo();
        }, 3500);

        return () => clearTimeout(timer);
      }
    }
  }, [info, setShowInfoCard, shouldShowPasswordMessage, clearInfo]);

  // Don't render anything if there's nothing to show
  if (!shouldShowPasswordMessage && !showInfoCard) {
    return null;
  }

  return (
    <div className={styles.container}>
      {shouldShowPasswordMessage ? (
        <div className={styles.passwordMessageContainer}>
          <KeyRound color="var(--saturated-orange)" size={20} />
          <div className={styles.repeatPasswordMessage}>
            Confirma la contraseña
          </div>
        </div>
      ) : (
        latestInfo && (
          <>
            <MessageCircleWarning color="#F59925" size={20} />
            <div className={styles.infoList}>
              {/* 🔄 UPDATE: Only display the latest info message */}
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