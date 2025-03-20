import React from 'react';
import ShopRow from './ShopRow';
import styles from '../../../../../../../public/css/ShopsListBySeller.module.css';

const ShopsTable = ({ 
  shops, 
  isShopSelected, 
  handleSelectShop, 
  handleUpdateShop, 
  handleDeleteShop 
}) => {
  if (!shops || shops.length === 0) {
    return (
      <div className={styles.messageNoShops}>
        No tienes comercios registrados. ¡Agrega uno para comenzar!
      </div>
    );
  }
  
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tableHeader}>
          <th className={styles.tableHeaderCell}></th>
          <th className={styles.tableHeaderCell}>Nombre</th>
          <th className={styles.tableHeaderCell}>Ubicación</th>
          <th className={styles.tableHeaderCell}>Tipo</th>
          <th className={styles.tableHeaderCell}>Sub-tipo</th>
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
          />
        ))}
      </tbody>
    </table>
  );
};

export default ShopsTable;