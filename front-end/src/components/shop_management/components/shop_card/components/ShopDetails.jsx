import React, { memo, useMemo } from 'react';
import { Store, MapPinned, Clock, Calendar, Bike, Star } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopCard.module.css';


const RatingStars = ({ rating }) => {
  // Convert rating to number and handle if it's not available
  const numericRating = parseFloat(rating) || 0;
  
  // Generate star components based on rating
  const stars = useMemo(() => {
    const starsArray = [];
    
    // Create 5 stars (empty or filled)
    for (let i = 1; i <= 5; i++) {
      // Determine if this star should be filled
      const isFilled = i <= numericRating;
      
      starsArray.push(
        <Star 
          key={i}
          size={11} 
          className={`${styles.starIcon} ${isFilled ? styles.filledStar : styles.emptyStar}`}
          fill={isFilled ? "currentColor" : "none"}
        />
      );
    }
    
    return starsArray;
  }, [numericRating]);
  
  return (
    <div className={styles.starsContainer}>
      {stars}
    </div>
  );
};

const ShopDetails = memo(({ shop, formatTime, formatShopType, hasContinuousSchedule, formatOpenDays }) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{shop?.name_shop}</h2>
        
        {/* 🌟 UPDATE: Replaced numeric rating with star display */}
        <RatingStars rating={shop?.calification_shop} />
      </div>
      
      {/*update: Wrapped all info items in a single container with consistent spacing*/}
      <div className={styles.scheduleInfo}>
        <p className={styles.shopType}>
          <Store size={14} className={styles.icon} />
          {formatShopType}
        </p>
        
        <p className={styles.location}>
          <MapPinned size={14} className={styles.icon} />
          {shop?.location_shop}
        </p>
        
        {hasContinuousSchedule ? (
          <span className={styles.scheduleTime}>
            <Clock size={14} className={styles.icon} />
            {formatTime(shop?.morning_open)} - {formatTime(shop?.afternoon_close)}
          </span>
        ) : (
          <>
            <span className={styles.scheduleTime}>
              <Clock size={14} className={styles.icon} />
              Mañana: {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
            </span>
            <span className={styles.scheduleTime}>
              <Clock size={14} className={styles.icon} />
              Tarde: {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
            </span>
          </>
        )}
        
        <span className={styles.scheduleTime}>
          <Calendar size={14} className={styles.icon} />
          {formatOpenDays(shop)}
        </span>
        
        <span className={styles.scheduleTime}>
          <Bike size={14} className={styles.icon} />
          Delivery {shop?.has_delivery ? 'disponible' : 'no disponible'}
        </span>
      </div>
    </div>
  );
});

export default ShopDetails;