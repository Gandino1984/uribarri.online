import React from 'react';
import styles from '../../../../../../../../css/ShopProductsList.module.css';

const NoShopSelected = ({ setShowProductManagement }) => {
  return (
    <div className={styles.noShopSelected || styles.noProducts}>
      <h2>No hay comercio seleccionado</h2>
      <button 
        className={styles.actionButton}
        title="Volver"
        onClick={() => {
          setShowProductManagement(false);
        }}
      >
        Volver
      </button>
    </div>
  );
};

export default NoShopSelected;