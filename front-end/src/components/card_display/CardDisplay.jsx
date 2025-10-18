//update: Added notification history tracking
import { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../css/CardDisplay.module.css';
import ErrorCard from '../card_display/components/error_card/ErrorCard.jsx';
import SuccessCard from '../card_display/components/success_card/SuccessCard.jsx';
import InfoCard from '../card_display/components/info_card/InfoCard.jsx';
import NotificationHistory from './components/NotificationHistory.jsx';
import { useUI } from '../../app_context/UIContext.jsx';

function CardDisplay() {
  const [activeCards, setActiveCards] = useState([]);
  const cardIdCounter = useRef(0);
  
  const {
    error,
    success,
    info,
    showErrorCard,
    showSuccessCard, 
    showInfoCard,
    setShowErrorCard,
    setShowSuccessCard,
    setShowInfoCard,
    clearError,
    clearSuccess,
    clearInfo,
    //update: Get history function
    addToCardHistory
  } = useUI();
  
  const hasAnyValue = (obj) => {
    return obj && Object.values(obj).some(value => value);
  };
  
  //update: Add card with history tracking
  const addCard = (type, content) => {
    const newCard = {
      id: cardIdCounter.current++,
      type,
      content,
      isVisible: false
    };
    
    setActiveCards(prev => [...prev, newCard]);
    
    //update: Add to history when card is created
    addToCardHistory(type, content);
    
    setTimeout(() => {
      setActiveCards(prev => 
        prev.map(card => 
          card.id === newCard.id ? { ...card, isVisible: true } : card
        )
      );
    }, 10);
    
    setTimeout(() => {
      removeCard(newCard.id, type);
    }, 4000);
  };
  
  const removeCard = (cardId, type) => {
    setActiveCards(prev => 
      prev.map(card => 
        card.id === cardId ? { ...card, isVisible: false } : card
      )
    );
    
    setTimeout(() => {
      setActiveCards(prev => prev.filter(card => card.id !== cardId));
      
      switch(type) {
        case 'error':
          setShowErrorCard(false);
          clearError();
          break;
        case 'success':
          setShowSuccessCard(false);
          clearSuccess();
          break;
        case 'info':
          setShowInfoCard(false);
          clearInfo();
          break;
      }
    }, 300);
  };
  
  useEffect(() => {
    if (error && hasAnyValue(error) && !activeCards.some(c => c.type === 'error')) {
      setShowErrorCard(true);
      addCard('error', error);
    }
  }, [error]);
  
  useEffect(() => {
    if (success && hasAnyValue(success) && !activeCards.some(c => c.type === 'success')) {
      setShowSuccessCard(true);
      addCard('success', success);
    }
  }, [success]);
  
  useEffect(() => {
    if (info && hasAnyValue(info) && !activeCards.some(c => c.type === 'info')) {
      setShowInfoCard(true);
      addCard('info', info);
    }
  }, [info]);

  return (
    <>
      <div className={styles.cardDisplayContainer}>
        {activeCards.map((card) => (
          <AnimatedCard 
            key={card.id} 
            card={card}
            onClose={() => removeCard(card.id, card.type)}
          />
        ))}
      </div>
      {/* update: Add notification history button */}
      <NotificationHistory />
    </>
  );
}

const AnimatedCard = ({ card, onClose }) => {
  const slideAnimation = useSpring({
    from: {
      opacity: 0,
      transform: 'translate(-50%, -150%)',
    },
    to: {
      opacity: card.isVisible ? 1 : 0,
      transform: card.isVisible ? 'translate(-50%, 0%)' : 'translate(-50%, -150%)',
    },
    config: {
      mass: 1,
      tension: 180,
      friction: 20
    }
  });
  
  const getCardComponent = () => {
    switch(card.type) {
      case 'error':
        return <ErrorCard />;
      case 'success':
        return <SuccessCard />;
      case 'info':
        return <InfoCard />;
      default:
        return null;
    }
  };
  
  return (
    <animated.div 
      className={styles.cardWrapper}
      style={slideAnimation}
    >
      <div className={styles.cardContent} onClick={onClose}>
        {getCardComponent()}
      </div>
    </animated.div>
  );
};

export default CardDisplay;