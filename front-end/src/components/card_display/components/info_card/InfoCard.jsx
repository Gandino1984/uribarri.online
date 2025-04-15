import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/InfoCard.module.css';
import OButton from '../../../Obutton/Obutton.jsx';
import { MessageCircleWarning, KeyRound } from 'lucide-react'; // 🔔 UPDATE: Using existing imports

const InfoCard = () => {
  // State to track the most recent info message
  const [latestInfo, setLatestInfo] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
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
      setIsVisible(false);
      setTimeout(() => {
        setShowInfoCard(false);
        setLatestInfo('');
      }, 400); // Matching the animation duration
    } else if (hasInfo) {
      // Find the latest info message
      const mostRecentInfo = infoEntries[infoEntries.length - 1][1];
      setLatestInfo(mostRecentInfo);
      setShowInfoCard(true);
      
      // Small delay before showing to ensure animation runs properly
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
      
      // Only set the timeout if we're not showing the password message
      if (!shouldShowPasswordMessage) {
        const timer = setTimeout(() => {
          // First hide the card with animation
          setIsVisible(false);
          // Then clear the info after animation completes
          setTimeout(() => {
            setShowInfoCard(false);
            clearInfo();
          }, 400); // Matching the animation duration
        }, 3500);

        return () => clearTimeout(timer);
      }
    }
  }, [info, setShowInfoCard, shouldShowPasswordMessage, clearInfo]);

  // Added container style based on visibility
  const containerStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
  };

  // Don't render anything if there's nothing to show
  if (!shouldShowPasswordMessage && !showInfoCard) {
    return null;
  }

  return (
    <div className={styles.container} style={!shouldShowPasswordMessage ? containerStyle : {}}>
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