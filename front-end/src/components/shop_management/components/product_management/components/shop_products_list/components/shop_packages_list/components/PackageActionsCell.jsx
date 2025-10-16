import React from 'react';
import { 
  Pencil, 
  Trash2, 
  ArrowRightFromLine,
  ArrowLeftFromLine,
  Eye,
  EyeOff
} from 'lucide-react';
import styles from '../../../../../../../../../../css/ShopPackagesList.module.css';

const PackageActionsCell = ({ 
  package: packageItem, 
  activeActionsMenu, 
  toggleActionsMenu,
  handleUpdatePackage,
  handleDeletePackage,
  handleToggleActiveStatus,
  currentDeletingPackage,
  isSmallScreen
}) => {
  // 📱 Adjust icon sizes based on screen size
  const iconSize = isSmallScreen ? 18 : 20;
  const mainIconSize = isSmallScreen ? 20 : 22;
  
  return (
    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
      <div className={`${styles.actionsCellWrapper} ${activeActionsMenu === packageItem.id_package ? styles.active : ''}`}>
        <button
          className={`${styles.mainActionButton} ${activeActionsMenu === packageItem.id_package ? styles.active : ''}`}
          onClick={(e) => toggleActionsMenu(packageItem.id_package, e)}
          title="Acciones"
          style={{ overflow: 'visible' }}
        >
          {activeActionsMenu === packageItem.id_package ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftFromLine size={mainIconSize} strokeWidth={2} />
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightFromLine size={mainIconSize} strokeWidth={2} />
            </span>
          )}
        </button>
        
        <div className={styles.actionButtonsContainer}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdatePackage(packageItem.id_package);
              toggleActionsMenu(packageItem.id_package, e);
            }}
            className={`${styles.actionButton} ${styles.updateButton}`}
            title="Actualizar paquete"
          >
            <Pencil size={iconSize} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePackage(packageItem.id_package);
              toggleActionsMenu(packageItem.id_package, e);
            }}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Eliminar paquete"
            type="button"
            disabled={currentDeletingPackage?.current === packageItem.id_package}
          >
            <Trash2 size={iconSize} />
          </button>
          {/* Toggle active status button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActiveStatus(packageItem.id_package);
              toggleActionsMenu(packageItem.id_package, e);
            }}
            className={`${styles.actionButton} ${packageItem.active_package ? styles.visibleButton : styles.hiddenButton}`}
            title={packageItem.active_package ? "Desactivar paquete" : "Activar paquete"}
          >
            {packageItem.active_package ? (
              <Eye size={iconSize} />
            ) : (
              <EyeOff size={iconSize} />
            )}
          </button>
        </div>
      </div>
    </td>
  );
};

export default PackageActionsCell;