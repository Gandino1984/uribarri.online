import React, { memo } from 'react';
import { Minimize2, Edit, Map, Star, AlertTriangle, User, Mail } from 'lucide-react';
import styles from '../../../../../../css/ShopCard.module.css';

const ShopHeader = memo(({
  minimized,
  toggleMinimized,
  handleUpdateShop,
  toggleMap,
  handleToggleValoration,
  handleReport,
  handleShowOwnerInfo,
  handleToggleEmailForm,
  isSeller,
  canValorate,
  showValorationForm,
  showOwnerInfo,
  showEmailForm
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
        <Minimize2 className={styles.headerIcon} />
      </button>

      {isSeller && (
        <button
          className={styles.active}
          onClick={handleUpdateShop}
          title="Editar comercio"
          aria-label="Editar comercio"
        >
          <Edit className={styles.headerIcon} />
        </button>
      )}

      <button
        className={styles.active}
        onClick={toggleMap}
        title="Mostrar ubicación en mapa"
        aria-label="Mostrar ubicación en mapa"
      >
        <Map className={styles.headerIcon} />
      </button>

      {canValorate && (
        <button
          className={`${styles.active} ${showValorationForm ? styles.activeToggled : ''}`}
          onClick={handleToggleValoration}
          title="Valorar comercio"
          aria-label="Valorar comercio"
        >
          <Star className={styles.headerIcon} />
        </button>
      )}

      <button
        className={`${styles.active} ${showOwnerInfo ? styles.activeToggled : ''}`}
        onClick={handleShowOwnerInfo}
        title="Ver información del propietario"
        aria-label="Ver información del propietario"
      >
        <User className={styles.headerIcon} />
      </button>

      {canValorate && (
        <button
          className={`${styles.active} ${showEmailForm ? styles.activeToggled : ''}`}
          onClick={handleToggleEmailForm}
          title="Contactar con el comercio"
          aria-label="Contactar con el comercio"
        >
          <Mail className={styles.headerIcon} />
        </button>
      )}

      <button
        className={styles.active}
        onClick={handleReport}
        title="Reportar actividad inusual"
        aria-label="Reportar actividad inusual"
      >
        <AlertTriangle className={styles.headerIcon} />
      </button>
    </div>
  );
});

ShopHeader.displayName = 'ShopHeader';

export default ShopHeader;