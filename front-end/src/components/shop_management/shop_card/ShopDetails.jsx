import React, { memo } from 'react';
import { Store, MapPinned, Clock } from 'lucide-react';
import styles from '../../../../../public/css/ShopCard.module.css';

// UPDATE: Created separate component file for shop details
const ShopDetails = memo(({ shop, formatTime, formatShopType, hasContinuousSchedule }) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{shop?.name_shop}</h2>
        <p className={styles.rating}>
          Calificación: {shop?.calification_shop || 'No disponible'}/5
        </p>
      </div>
      <p className={styles.shopType}>
        <Store size={16} className={styles.shopTypeIcon} />
        {formatShopType}
      </p>
      <p className={styles.location}>
        <MapPinned size={16} className={styles.locationIcon} />
        {shop?.location_shop}
      </p>
      <div className={styles.scheduleContainer}>
        <div className={styles.scheduleInfo}>
          {hasContinuousSchedule ? (
            <span className={styles.scheduleTime}>
              <Clock size={16} className={styles.scheduleIcon} />
              Horario: {formatTime(shop?.morning_open)} - {formatTime(shop?.afternoon_close)}
            </span>
          ) : (
            <>
              <span className={styles.scheduleTime}>
                Mañana: {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
              </span>
              <span className={styles.scheduleTime}>
                Tarde: {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default ShopDetails;