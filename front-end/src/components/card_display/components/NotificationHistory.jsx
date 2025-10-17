//update: New notification history component
import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Bell, X } from 'lucide-react';
import { useUI } from '../../../../src/app_context/UIContext.jsx';
import styles from '../../../../css/NotificationHistory.module.css';

const NotificationHistory = () => {
  const {
    cardHistory,
    clearCardHistory,
    showNotificationHistory,
    setShowNotificationHistory
  } = useUI();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleHistory = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setShowNotificationHistory(newState);
  };
  
  const handleClearHistory = () => {
    clearCardHistory();
    setIsOpen(false);
    setShowNotificationHistory(false);
  };
  
  const panelAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateX(0%)' : 'translateX(100%)',
    config: {
      mass: 1,
      tension: 280,
      friction: 26
    }
  });
  
  const getCardTypeClass = (type) => {
    switch(type) {
      case 'error':
        return styles.errorItem;
      case 'success':
        return styles.successItem;
      case 'info':
        return styles.infoItem;
      default:
        return '';
    }
  };
  
  const getCardTypeLabel = (type) => {
    switch(type) {
      case 'error':
        return 'Error';
      case 'success':
        return 'Éxito';
      case 'info':
        return 'Info';
      default:
        return '';
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMessageText = (content) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      const values = Object.values(content).filter(v => v);
      return values[values.length - 1] || '';
    }
    return '';
  };
  
  return (
    <>
      {/* update: Notification history button */}
      <button 
        className={styles.historyButton}
        onClick={toggleHistory}
        aria-label="Ver historial de notificaciones"
      >
        <Bell size={20} />
      </button>
      
      {/* update: History panel */}
      {isOpen && (
        <>
          <div 
            className={styles.overlay}
            onClick={toggleHistory}
          />
          <animated.div 
            className={styles.historyPanel}
            style={panelAnimation}
          >
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Historial</h3>
              <button 
                className={styles.closeButton}
                onClick={toggleHistory}
                aria-label="Cerrar historial"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.panelContent}>
              {cardHistory.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={32} className={styles.emptyIcon} />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <>
                  <div className={styles.historyList}>
                    {cardHistory.map((card) => (
                      <div 
                        key={card.id}
                        className={`${styles.historyItem} ${getCardTypeClass(card.type)}`}
                      >
                        <div className={styles.itemHeader}>
                          <span className={styles.itemType}>
                            {getCardTypeLabel(card.type)}
                          </span>
                          <span className={styles.itemTime}>
                            {formatTime(card.timestamp)}
                          </span>
                        </div>
                        <div className={styles.itemMessage}>
                          {getMessageText(card.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className={styles.clearButton}
                    onClick={handleClearHistory}
                  >
                    Limpiar historial
                  </button>
                </>
              )}
            </div>
          </animated.div>
        </>
      )}
    </>
  );
};

export default NotificationHistory;