import React, { memo } from 'react';
import { Minimize2, Edit, Map } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopCard.module.css';


const ShopHeader = memo(({ minimized, toggleMinimized, handleUpdateShop, toggleMap, isSeller }) => {
  if (minimized) return null;
  
  return (
    <div className={styles.headerControls}>
      <button 
        className={styles.active} 
        onClick={toggleMinimized}
        title="Minimizar tarjeta"
        aria-label="Minimizar tarjeta"
      >
        <Minimize2 size={16} />
      </button>
      
      {isSeller && (
        <button 
          className={styles.active} 
          onClick={handleUpdateShop}
          title="Editar comercio"
          aria-label="Editar comercio"
        >
          <Edit size={16} />
        </button>
      )}
      
      <button 
        className={styles.active}
        onClick={toggleMap}
        title="Mostrar ubicación en mapa"
        aria-label="Mostrar ubicación en mapa"
      >
        <Map size={16} />
      </button>
    </div>
  );
});

export default ShopHeader;