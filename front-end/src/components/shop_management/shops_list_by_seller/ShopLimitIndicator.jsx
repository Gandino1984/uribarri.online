import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from '../../../../../public/css/ShopsListBySeller.module.css';

/**
 * Component to display information about the shop creation limit
 * 
 * @param {Object} props
 * @param {number} props.shopCount - Current number of shops
 * @param {number} props.shopLimit - Maximum allowed shops
 * @param {boolean} props.isUserSponsor - Whether the user is a sponsor
 */
const ShopLimitIndicator = ({ shopCount, shopLimit, isUserSponsor }) => {
  const percentUsed = (shopCount / shopLimit) * 100;
  let statusColorClass = styles.statusGreen; 
  
  if (percentUsed >= 90) {
    statusColorClass = styles.statusRed;
  } else if (percentUsed >= 70) {
    statusColorClass = styles.statusOrange;
  }
  
  return (
    <div className={styles.shopLimitInfo}>
      <div className={styles.limitHeader}>
        <AlertCircle className={statusColorClass} size={16} />
        <span>Límite de creación de comercios: {shopCount} / {shopLimit}</span>
      </div>

      {!isUserSponsor && shopCount >= shopLimit * 0.7 && (
        <p className={styles.upgradeMessage}>
          Conviértete en sponsor para aumentar tu límite a 5 comercios.
        </p>
      )}
    </div>
  );
};

export default ShopLimitIndicator;