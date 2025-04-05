import React, { useEffect, useState } from 'react';
import ShopRow from './ShopRow';
import styles from '../../../../../../../public/css/ShopsListBySeller.module.css';

/**
 * Component for displaying shops in a responsive table
 * 
 * @param {Object} props
 * @param {Array} props.shops - List of shop objects
 * @param {Function} props.isShopSelected - Function to determine if a shop is selected
 * @param {Function} props.handleSelectShop - Handler for shop selection
 * @param {Function} props.handleUpdateShop - Handler for shop update action
 * @param {Function} props.handleDeleteShop - Handler for shop delete action
 */
const ShopsTable = ({ 
  shops, 
  isShopSelected, 
  handleSelectShop, 
  handleUpdateShop, 
  handleDeleteShop 
}) => {
  // 📱 UPDATE: Added state to track window width for responsive adjustments
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // 📱 UPDATE: Added window resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // If no shops, display message
  if (!shops || shops.length === 0) {
    return (
      <div className={styles.messageNoShops}>
        No tienes comercios registrados. ¡Agrega uno para comenzar!
      </div>
    );
  }
  
  // 📱 UPDATE: Determine which columns to show based on screen width
  const showSubtype = windowWidth > 500;
  
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tableHeader}>
          <th className={styles.tableHeaderCell}></th>
          <th className={styles.tableHeaderCell}>Nombre</th>
          <th className={styles.tableHeaderCell}>Ubicación</th>
          <th className={styles.tableHeaderCell}>Tipo</th>
          {showSubtype && (
            <th className={styles.tableHeaderCell}>Sub-tipo</th>
          )}
          <th className={styles.tableHeaderCell}>Calificación</th>
        </tr>
      </thead>
      <tbody>
        {shops.map((shop) => (
          <ShopRow 
            key={shop.id_shop}
            shop={shop}
            isSelected={isShopSelected(shop.id_shop)}
            onSelect={handleSelectShop}
            onUpdate={handleUpdateShop}
            onDelete={handleDeleteShop}
            showSubtype={showSubtype}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ShopsTable;