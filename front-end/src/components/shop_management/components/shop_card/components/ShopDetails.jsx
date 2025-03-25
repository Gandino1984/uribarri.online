import React, { memo } from 'react';
import { Store, MapPinned, Clock, Calendar, Truck } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopCard.module.css';

const ShopDetails = memo(({ shop, formatTime, formatShopType, hasContinuousSchedule, formatOpenDays }) => {
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
                <Clock size={16} className={styles.scheduleIcon} />
                Mañana: {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
              </span>
              <span className={styles.scheduleTime}>
                <Clock size={16} className={styles.scheduleIcon} />
                Tarde: {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
              </span>
            </>
          )}
          
          {/* UPDATE: Show open days */}
          <span className={styles.scheduleTime}>
            <Calendar size={16} className={styles.scheduleIcon} />
            Días: {formatOpenDays(shop)}
          </span>
          
          {/* UPDATE: Show delivery status */}
          <span className={styles.scheduleTime}>
            <Truck size={16} className={styles.scheduleIcon} />
            Delivery: {shop?.has_delivery ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShopDetails;