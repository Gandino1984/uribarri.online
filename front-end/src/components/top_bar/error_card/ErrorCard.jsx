import React, { useContext, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ErrorCard.module.css';
import { CircleX } from 'lucide-react';

const ErrorCard = () => {
  const {
    showErrorCard, 
    setShowErrorCard,
    error,
  } = useContext(AppContext);

  useEffect(() => {
    const hasErrors = Object.values(error).some(err => err !== '');
    
    if (!hasErrors) {
      setShowErrorCard(false);
    } else {
      setShowErrorCard(true);
      
      const timer = setTimeout(() => {
        setShowErrorCard(false);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [error, setShowErrorCard]);

  // Animation configuration
  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(-30px)'  // Start from above
    },
    to: { 
      opacity: showErrorCard ? 1 : 0,
      transform: showErrorCard ? 'translateY(5px)' : 'translateY(-100px)'
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  // Only render errors that actually have a message
  const activeErrors = Object.entries(error).filter(([_, value]) => value !== '');

  return (
    showErrorCard && activeErrors.length > 0 && (
      <animated.div style={springProps} className={styles.container}>
        <CircleX color="red" size={24} />
        <div className={styles.errorList}>
          {activeErrors.map(([key, value]) => (
            <div className={styles.errorItem} key={key}>
              {value}
            </div>
          ))}
        </div>
      </animated.div>
    )
  );
};

export default ErrorCard;