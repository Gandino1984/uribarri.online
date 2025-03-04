import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { MapPinned, Clock, Minimize2, Maximize2 } from 'lucide-react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from '../shop_card/shop_cover_image/ShopCoverImage.jsx';

const ShopCard = ({ shop }) => {
  // UPDATE: Estado para controlar si la tarjeta está minimizada o no
  const [minimized, setMinimized] = useState(false);

  // UPDATE: Animación para la transición entre estados
  const cardAnimation = useSpring({
    from: { 
      opacity: 0,
      height: minimized ? 'auto' : '0px'
    },
    to: { 
      opacity: 1,
      height: minimized ? '50px' : 'auto' 
    },
    config: { tension: 280, friction: 20 }
  });

  const shopInfoAnimation = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: { transform: 'translateY(0px)', opacity: 1 },
    config: { tension: 280, friction: 20 },
    delay: 120
  });

  const formatTime = (time) => {
    if (!time) return '00:00';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // UPDATE: Función para alternar entre minimizado y maximizado
  const toggleMinimized = () => {
    setMinimized(prevState => !prevState);
  };

  return (
    <div className={`${styles.container} ${minimized ? styles.minimized : ''}`}>
      {/* UPDATE: Botón minimizado que aparece cuando la tarjeta está minimizada */}
      {minimized ? (
        <animated.div style={cardAnimation} className={styles.minimizedCard} onClick={toggleMinimized}>
          <div className={styles.minimizedContent}>
            <span className={styles.minimizedText}>Mi tienda</span>
            <Maximize2 size={18} className={styles.toggleIcon} />
          </div>
        </animated.div>
      ) : (
        <>
          <div className={styles.headerControls}>
            {/* UPDATE: Botón para minimizar la tarjeta */}
            <button 
              className={styles.minimizeButton} 
              onClick={toggleMinimized}
              aria-label="Minimizar tarjeta"
            >
              <Minimize2 size={18} />
            </button>
          </div>
          <ShopCoverImage id_shop={shop.id_shop} />
          
          <animated.div style={shopInfoAnimation} className={styles.infoContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>{shop?.name_shop}</h2>
              <p className={styles.rating}>
                Calificación: {shop?.calification_shop || 'No disponible'}/5
              </p>
            </div>
            <p className={styles.location}>
              <MapPinned size={16} className={styles.locationIcon} />
              {shop?.location_shop}
            </p>
            <div className={styles.scheduleContainer}>
              <div className={styles.scheduleInfo}>
                <span className={styles.scheduleTime}>
                  Mañana  {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
                </span>
                <span className={styles.scheduleTime}>
                  Tarde  {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
                </span>
              </div>
            </div>
          </animated.div>
        </>
      )}
    </div>
  );
};

export default ShopCard;