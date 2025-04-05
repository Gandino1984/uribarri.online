import React from 'react';
import styles from '../../../../../../../public/css/ShopCreationForm.module.css';
import { Truck } from 'lucide-react';
import CustomToggleSwitch from '../../../../navigation_components/CustomToggleSwitch';

// Component for toggling delivery service option
const ShopDeliveryToggle = ({ newShop, setNewShop }) => {
  // UPDATE: Added delivery service toggle component
  const handleDeliveryToggle = (isChecked) => {
    setNewShop({
      ...newShop,
      has_delivery: isChecked
    });
  };

  return (
    <div className={styles.deliveryContainer}>
      <h4 className={styles.scheduleTitle}>
        <Truck size={16} className={styles.scheduleIcon} />
        Servicio de entrega
      </h4>
      <div className={styles.deliveryToggleWrapper}>
        <CustomToggleSwitch 
          checked={newShop.has_delivery || false}
          onChange={handleDeliveryToggle}
          leftLabel="No disponible"
          rightLabel="Disponible"
        />
      </div>
    </div>
  );
};

export default ShopDeliveryToggle;