import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { MapPinned, Clock } from 'lucide-react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from '../shop_card/shop_cover_image/ShopCoverImage.jsx';

const ShopCard = ({ shop }) => {
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

  return (
    <div className={styles.container}>
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
          {/* <Clock size={16} className={styles.scheduleIcon} /> */}
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
    </div>
  );
};

export default ShopCard;