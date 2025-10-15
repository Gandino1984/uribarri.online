import React, { memo } from 'react';
import { Minimize2, Edit, Map, Star, AlertTriangle, User } from 'lucide-react';
import styles from '../../../../../../css/ShopCard.module.css';

const ShopHeader = memo(({ 
  minimized, 
  toggleMinimized, 
  handleUpdateShop, 
  toggleMap, 
  handleToggleValoration,
  handleReport,
  handleShowOwnerInfo,
  isSeller, 
  canValorate,
  showValorationForm,
  showOwnerInfo
}) => {
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
      
      {canValorate && (
        <button 
          className={`${styles.active} ${showValorationForm ? styles.activeToggled : ''}`}
          onClick={handleToggleValoration}
          title="Valorar comercio"
          aria-label="Valorar comercio"
        >
          <Star size={16} />
        </button>
      )}
      
      {/*update: Owner info button */}
      <button 
        className={`${styles.active} ${showOwnerInfo ? styles.activeToggled : ''}`}
        onClick={handleShowOwnerInfo}
        title="Ver información del propietario"
        aria-label="Ver información del propietario"
      >
        <User size={16} />
      </button>
      
      <button 
        className={styles.active}
        onClick={handleReport}
        title="Reportar actividad inusual"
        aria-label="Reportar actividad inusual"
      >
        <AlertTriangle size={16} />
      </button>
    </div>
  );
});

ShopHeader.displayName = 'ShopHeader';

export default ShopHeader;