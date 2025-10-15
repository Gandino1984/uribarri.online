import React from 'react';
import ProductActionsCell from './ProductActionsCell';
import ProductImage from '../../product_image/ProductImage';
import styles from '../../../../../../../../css/ShopProductsList.module.css';

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
  currentDeletingProduct,
  showExtendedInfo,
  showMediumInfo,
  isSmallScreen,
  //update: Added categories and subcategories props
  categories,
  subcategories
}) => {
  // Determine if product is inactive to apply styling
  const isInactive = product.active_product === false || product.active_product === 0;
  
  // 📱 UPDATE: Enhanced text formatting with very strict truncation for tiny screens
  const formatText = (text, maxLength = 20) => {
    if (!text) return '-';
    
    // Different maximum lengths based on screen size
    const actualMaxLength = isSmallScreen 
      ? (window.innerWidth < 374 ? 5 : window.innerWidth < 480 ? 8 : 12) 
      : maxLength;
    
    if (text.length > actualMaxLength) {
      return `${text.substring(0, actualMaxLength)}...`;
    }
    return text;
  };
  
  // 📱 UPDATE: Simplified price formatting for tiny screens
  const formatPrice = (price) => {
    if (!price) return '-';
    return window.innerWidth < 374 ? `€${price}` : `€${price}`;
  };
  
  // 📱 UPDATE: Super compact discount formatting for tiny screens
  const formatDiscount = (discount) => {
    if (!discount || discount <= 0) {
      return window.innerWidth < 374 ? '-' : (isSmallScreen ? '-' : 'No');
    }
    return window.innerWidth < 374 ? `${discount}` : `${discount}%`;
  };
  
  //update: Helper function to get category name from ID
  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories || categories.length === 0) {
      // Fallback to type_product if no category ID
      return product.type_product || '-';
    }
    
    const category = categories.find(cat => cat.id_category === categoryId);
    return category ? category.name_category : (product.type_product || '-');
  };
  
  //update: Enhanced helper function to get subcategory name
  const getSubcategoryName = () => {
    // First check if we have a subcategory ID
    if (product.id_subcategory && subcategories && Array.isArray(subcategories)) {
      const subcategory = subcategories.find(sub => sub.id_subcategory === product.id_subcategory);
      if (subcategory) {
        return subcategory.name_subcategory;
      }
    }
    
    // Fallback to subtype_product field
    return product.subtype_product || '-';
  };
  
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
        isSmallScreen={isSmallScreen}
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
      <td className={`${styles.tableCell} ${styles.mediumCell}`}>
        {formatText(product.name_product, isSmallScreen ? 12 : 30)}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatPrice(product.price_product)}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatText(getCategoryName(product.id_category), isSmallScreen ? 6 : 15)}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatText(getSubcategoryName(), isSmallScreen ? 6 : 15)}
      </td>
      {showMediumInfo && (
        <>
          <td className={`${styles.tableCell} ${styles.smallCell}`}>
            {formatText(product.country_product, 8) || '-'}
          </td>
          <td className={`${styles.tableCell} ${styles.smallCell}`}>
            {formatText(product.locality_product, 8) || '-'}
          </td>
        </>
      )}
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatText(product.season_product, isSmallScreen ? 5 : 15)}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatDiscount(product.discount_product)}
      </td>
      {showMediumInfo && (
        <>
          <td className={`${styles.tableCell} ${styles.smallCell}`}>
            {product.sold_product}
          </td>
          <td className={`${styles.tableCell} ${styles.smallCell}`}>
            {isSmallScreen ? (product.second_hand ? 'Sí' : 'No') : formatSecondHand(product.second_hand)}
          </td>
        </>
      )}
      {showExtendedInfo && (
        <>
          <td className={`${styles.tableCell} ${styles.largeCell}`}>
            {formatText(product.info_product, isSmallScreen ? 15 : 50)}
          </td>
          <td className={`${styles.tableCell} ${styles.smallCell}`}>
            {formatDate(product.expiration_product)}
          </td>
        </>
      )}
      {showMediumInfo && <td className={`${styles.tableCell} ${styles.smallCell}`}>{product.surplus_product}</td>}
    </tr>
  );
};

export default ProductTableRow;