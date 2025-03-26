import React from 'react';
import ProductActionsCell from './ProductActionsCell';
import ProductImage from '../../product_image/ProductImage';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ProductTableRow = ({ 
  product, 
  selectedProducts, 
  activeActionsMenu,
  handleProductRowClick,
  toggleActionsMenu,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSelectProduct,
  handleSelectForImageUpload,
  handleToggleActiveStatus,
  handleProductImageDoubleClick,
  formatDate,
  formatSecondHand,
  currentDeletingProduct
}) => {
  // UPDATE: Added logic to determine if product is inactive to apply styling
  const isInactive = product.active_product === false || product.active_product === 0;
  
  return (
    <tr
      className={`${styles.tableRow} 
        ${selectedProducts.has(product.id_product) ? styles.selected : ''} 
        ${isInactive ? styles.inactiveProduct : ''}`}
      onClick={() => handleProductRowClick(product)}
      style={{ cursor: 'pointer' }}
    >
      <ProductActionsCell 
        product={product}
        activeActionsMenu={activeActionsMenu}
        toggleActionsMenu={toggleActionsMenu}
        handleUpdateProduct={handleUpdateProduct}
        handleDeleteProduct={handleDeleteProduct}
        handleSelectProduct={handleSelectProduct}
        handleSelectForImageUpload={handleSelectForImageUpload}
        handleToggleActiveStatus={handleToggleActiveStatus}
        selectedProducts={selectedProducts}
        currentDeletingProduct={currentDeletingProduct}
      />
      <td 
        className={`${styles.tableCell} ${styles.smallCell}`}
        onClick={(e) => {
          e.stopPropagation();
          handleProductImageDoubleClick(product);
        }}
      >
        <ProductImage id_product={product.id_product} />
      </td>
      <td className={`${styles.tableCell} ${styles.mediumCell}`}>{product.name_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>&euro;{product.price_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.type_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.subtype_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.country_product || '-'}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.locality_product || '-'}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.season_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {product.discount_product > 0 ? `${product.discount_product}%` : 'No'}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.sold_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{formatSecondHand(product.second_hand)}</td>
      <td className={`${styles.tableCell} ${styles.largeCell}`}>{product.info_product}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{formatDate(product.expiration_product)}</td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.surplus_product}</td>
    </tr>
  );
};

export default ProductTableRow;