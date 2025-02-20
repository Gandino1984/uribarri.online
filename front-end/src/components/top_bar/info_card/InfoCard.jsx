import React, { useContext, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/InfoCard.module.css';
import { MessageCircleWarning } from 'lucide-react';

const InfoCard = () => {
  const {
    showInfoCard,
    setShowInfoCard,
    info,
  } = useContext(AppContext);

  useEffect(() => {
    const hasInfo = Object.values(info).some(msg => msg !== '');
    
    if (!hasInfo) {
      setShowInfoCard(false);
    } else {
      setShowInfoCard(true);
      
      const timer = setTimeout(() => {
        setShowInfoCard(false);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [info, setShowInfoCard]);

  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(-50px)'
    },
    to: { 
      opacity: showInfoCard ? 1 : 0,
      transform: showInfoCard ? 'translateY(5px)' : 'translateY(-70px)'
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  const activeInfoMessages = Object.entries(info).filter(([_, value]) => value !== '');

  return (
    showInfoCard && activeInfoMessages.length > 0 && (
      <animated.div style={springProps} className={styles.container}>
        <MessageCircleWarning color="#F59925" size={20} />
        <div className={styles.infoList}>
          {activeInfoMessages.map(([key, value]) => (
            <div className={styles.infoItem} key={key}>
              {value}
            </div>
          ))}
        </div>
      </animated.div>
    )
  );
};

export default InfoCard;