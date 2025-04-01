import React from 'react';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  ImagePlus,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  Eye,
  EyeOff
} from 'lucide-react';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ProductActionsCell = ({ 
  product, 
  activeActionsMenu, 
  toggleActionsMenu,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSelectProduct,
  handleSelectForImageUpload,
  handleToggleActiveStatus,
  selectedProducts,
  currentDeletingProduct,
  isSmallScreen  // 📱 UPDATE: Added isSmallScreen prop
}) => {
  // 📱 UPDATE: Adjust icon sizes based on screen size
  const iconSize = isSmallScreen ? 18 : 20;
  const mainIconSize = isSmallScreen ? 20 : 22;
  
  return (
    <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
      <div className={`${styles.actionsCellWrapper} ${activeActionsMenu === product.id_product ? styles.active : ''}`}>
        <button
          className={`${styles.mainActionButton} ${activeActionsMenu === product.id_product ? styles.active : ''}`}
          onClick={(e) => toggleActionsMenu(product.id_product, e)}
          title="Acciones"
          style={{ overflow: 'visible' }}
        >
          {activeActionsMenu === product.id_product ? (
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
              handleUpdateProduct(product.id_product);
              toggleActionsMenu(product.id_product, e);
            }}
            className={`${styles.actionButton} ${styles.updateButton}`}
            title="Actualizar producto"
          >
            <Pencil size={iconSize} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product.id_product);
              toggleActionsMenu(product.id_product, e);
            }}
            className={`${styles.actionButton} ${styles.deleteButton}`}
            title="Eliminar producto"
            type="button"
            disabled={currentDeletingProduct?.current === product.id_product}
          >
            <Trash2 size={iconSize} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectProduct(product.id_product);
              toggleActionsMenu(product.id_product, e);
            }}
            className={`${styles.actionButton} ${styles.selectButton} ${
              selectedProducts.has(product.id_product) ? styles.selected : ''
            }`}
            title="Seleccionar producto"
          >
            <CheckCircle size={iconSize} />
          </button>
          <button
            onClick={(e) => handleSelectForImageUpload(product.id_product, e)}
            className={`${styles.actionButton} ${styles.imageButton}`}
            title="Seleccionar para subir imagen"
          >
            <ImagePlus size={iconSize} />
          </button>
          {/* Toggle active status button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActiveStatus(product.id_product);
              toggleActionsMenu(product.id_product, e);
            }}
            className={`${styles.actionButton} ${product.active_product ? styles.visibleButton : styles.hiddenButton}`}
            title={product.active_product ? "Desactivar producto" : "Activar producto"}
          >
            {product.active_product ? (
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

export default ProductActionsCell;