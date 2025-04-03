import React from 'react';
import { useUI } from '../../../../../../../../../../src/app_context/UIContext.jsx';
import styles from '../../../../../../../../../../../public/css/ShopPackagesList.module.css';

const NoShopSelected = () => {
  const { setShowProductManagement } = useUI();
  
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