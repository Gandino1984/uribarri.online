import React, { useEffect } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import styles from '../../../../../../public/css/InfoCard.module.css';
import { MessageCircleWarning, KeyRound } from 'lucide-react';

const InfoCard = () => {
  // UPDATE: Using useAuth and useUI hooks instead of AppContext
  const {
    isLoggingIn,
    showRepeatPasswordMessage,
    showPasswordRepeat
  } = useAuth();

  const {
    showInfoCard,
    setShowInfoCard,
    info,
  } = useUI();

  // Determine if we should show the password repeat message
  const shouldShowPasswordMessage = !isLoggingIn && showRepeatPasswordMessage && showPasswordRepeat;

  useEffect(() => {
    const hasInfo = Object.values(info).some(msg => msg !== '');
    
    // Only auto-hide the card if we're showing regular info messages
    // and not the password repeat message (which should stay visible until password is completed)
    if (!hasInfo && !shouldShowPasswordMessage) {
      setShowInfoCard(false);
    } else {
      setShowInfoCard(true);
      
      // Only set the timeout if we're not showing the password message
      if (!shouldShowPasswordMessage && hasInfo) {
        const timer = setTimeout(() => {
          setShowInfoCard(false);
        }, 3500);

        return () => clearTimeout(timer);
      }
    }
  }, [info, setShowInfoCard, shouldShowPasswordMessage]);

  const activeInfoMessages = Object.entries(info).filter(([_, value]) => value !== '');

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
        activeInfoMessages.length > 0 && (
          <>
            <MessageCircleWarning color="#F59925" size={20} />
            <div className={styles.infoList}>
              {activeInfoMessages.map(([key, value]) => (
                <div className={styles.infoItem} key={key}>
                  {value}
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default InfoCard;