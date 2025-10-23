import React, { memo, useMemo } from 'react';
import { Store, MapPinned, Clock, Calendar, Bike, Star } from 'lucide-react';
import styles from '../../../../../../css/ShopCard.module.css';


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

const ShopDetails = memo(({ shop, formatTime, formatShopType, hasContinuousSchedule, formatOpenDays, isOpen }) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{shop?.name_shop}</h2>
        
        <RatingStars rating={shop?.calification_shop} />
      </div>
      
      <div className={styles.scheduleInfo}>
          <span className={`${styles.openStatus} ${isOpen ? styles.open : styles.closed}`}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        <p className={styles.shopType}>
          <Store className={styles.icon} />
          {formatShopType}
        </p>

        <p className={styles.location}>
          <MapPinned className={styles.icon} />
          {shop?.location_shop}
        </p>

        {/* <div className={styles.scheduleWrapper}> */}
          {hasContinuousSchedule ? (
            <span className={styles.scheduleTime}>
              <Clock className={styles.icon} />
              {formatTime(shop?.morning_open)} - {formatTime(shop?.afternoon_close)}
            </span>
          ) : (
            <>
              <span className={styles.scheduleTime}>
                <Clock className={styles.icon} />
                Mañana: {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
              </span>
              <span className={styles.scheduleTime}>
                <Clock className={styles.icon} />
                Tarde: {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
              </span>
            </>
          )}
        
        {/* </div> */}

        <span className={styles.scheduleTime}>
          <Calendar className={styles.icon} />
          {formatOpenDays(shop)}
        </span>

        <span className={styles.scheduleTime}>
          <Bike className={styles.icon} />
          Delivery {shop?.has_delivery ? 'disponible' : 'no disponible'}
        </span>
      </div>
    </div>
  );
});

export default ShopDetails;