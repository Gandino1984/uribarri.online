import React, { useContext, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/SuccessCard.module.css';
import { CircleCheckBig } from 'lucide-react';

const SuccessCard = () => {
  const {
    showSuccessCard,
    setShowSuccessCard,
    success,
  } = useContext(AppContext);

  useEffect(() => {
    const hasSuccess = Object.values(success).some(msg => msg !== '');
    
    if (!hasSuccess) {
      setShowSuccessCard(false);
    } else {
      setShowSuccessCard(true);
      
      const timer = setTimeout(() => {
        setShowSuccessCard(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [success, setShowSuccessCard]);

  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(-50px)'
    },
    to: { 
      opacity: showSuccessCard ? 1 : 0,
      transform: showSuccessCard ? 'translateY(5px)' : 'translateY(-70px)'
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  const activeSuccessMessages = Object.entries(success).filter(([_, value]) => value !== '');

  return (
    showSuccessCard && activeSuccessMessages.length > 0 && (
      <animated.div style={springProps} className={styles.container}>
        <CircleCheckBig color="blue" size={20} />
        <div className={styles.successList}>
          {activeSuccessMessages.map(([key, value]) => (
            <div className={styles.successItem} key={key}>
              {value}
            </div>
          ))}
        </div>
      </animated.div>
    )
  );
};

export default SuccessCard;