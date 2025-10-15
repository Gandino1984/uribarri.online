import React from 'react';
import PackageActionsCell from './PackageActionsCell';
import styles from '../../../../../../../../../../css/ShopPackagesList.module.css';

const PackageTableRow = ({ 
  package: packageItem, 
  activeActionsMenu,
  toggleActionsMenu,
  handleUpdatePackage,
  handleDeletePackage,
  handleToggleActiveStatus,
  handlePackageRowClick,
  formatDate,
  formatActiveStatus,
  currentDeletingPackage,
  getProductDetailsForPackage,
  isSmallScreen
}) => {
  // Determine if package is inactive to apply styling
  const isInactive = packageItem.active_package === false || packageItem.active_package === 0;
  
  // 📱 Enhanced text formatting with very strict truncation for tiny screens
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
  
  // Get associated product details
  const productDetails = getProductDetailsForPackage(packageItem);
  
  // Count number of products in the package
  const productCount = productDetails.length;
  
  // Format product list for display
  const formatProductList = () => {
    if (productCount === 0) return "-";
    
    if (isSmallScreen) {
      return productCount.toString();
    }
    
    const productNames = productDetails.map(product => product.name_product || "Producto sin nombre");
    const displayText = productNames.join(', ');
    
    // Truncate if too long
    return formatText(displayText, 30);
  };
  
  return (
    <tr
      className={`${styles.tableRow} ${isInactive ? styles.inactiveProduct : ''}`}
      onClick={() => handlePackageRowClick(packageItem)}
      style={{ cursor: 'pointer' }}
    >
      <PackageActionsCell 
        package={packageItem}
        activeActionsMenu={activeActionsMenu}
        toggleActionsMenu={toggleActionsMenu}
        handleUpdatePackage={handleUpdatePackage}
        handleDeletePackage={handleDeletePackage}
        handleToggleActiveStatus={handleToggleActiveStatus}
        currentDeletingPackage={currentDeletingPackage}
        isSmallScreen={isSmallScreen}
      />
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {packageItem.id_package}
      </td>
      <td className={`${styles.tableCell} ${styles.mediumCell}`}>
        {formatText(packageItem.name_package, isSmallScreen ? 12 : 30) || "Sin nombre"}
      </td>
      <td className={`${styles.tableCell} ${styles.mediumCell}`}>
        {formatProductList()}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        {formatDate(packageItem.creation_package)}
      </td>
      <td className={`${styles.tableCell} ${styles.smallCell}`}>
        <span className={isInactive ? styles.inactive : styles.active}>
          {formatActiveStatus(packageItem.active_package)}
        </span>
      </td>
    </tr>
  );
};

export default PackageTableRow;