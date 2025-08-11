import React, { useState, useEffect } from 'react';
import ProductTableHeader from './ProductTableHeader';
import ProductTableRow from './ProductTableRow';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ProductsTable = ({ 
  displayedProducts, 
  selectedProducts,
  formatDate,
  formatSecondHand,
  handleProductRowClick,
  activeActionsMenu,
  toggleActionsMenu,
  handleUpdateProduct,
  handleDeleteProduct,
  handleSelectProduct,
  handleSelectForImageUpload,
  handleToggleActiveStatus,
  handleProductImageDoubleClick,
  currentDeletingProduct,
  //update: Added categories and subcategories props
  categories,
  subcategories
}) => {
  // 📱 UPDATE: Enhanced window width tracking with initial state and breakpoints
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // 📱 UPDATE: Improved resize handler with debounce for better performance
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100); // Add small debounce of 100ms
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial width calculation
    setWindowWidth(window.innerWidth);
    
    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 📱 UPDATE: More granular breakpoints for responsive design
  const showExtendedInfo = windowWidth > 1200;
  const showMediumInfo = windowWidth > 900;
  const isSmallScreen = windowWidth <= 600;

  return (
    <div className={styles.tableResponsiveWrapper}>
      <table className={styles.table}>
        <thead>
          <ProductTableHeader 
            showExtendedInfo={showExtendedInfo}
            showMediumInfo={showMediumInfo}
            isSmallScreen={isSmallScreen}
          />
        </thead>
        <tbody>
          {displayedProducts.map((product) => (
            <ProductTableRow 
              key={product.id_product}
              product={product}
              selectedProducts={selectedProducts}
              activeActionsMenu={activeActionsMenu}
              handleProductRowClick={handleProductRowClick}
              toggleActionsMenu={toggleActionsMenu}
              handleUpdateProduct={handleUpdateProduct}
              handleDeleteProduct={handleDeleteProduct}
              handleSelectProduct={handleSelectProduct}
              handleSelectForImageUpload={handleSelectForImageUpload}
              handleToggleActiveStatus={handleToggleActiveStatus}
              handleProductImageDoubleClick={handleProductImageDoubleClick}
              formatDate={formatDate}
              formatSecondHand={formatSecondHand}
              currentDeletingProduct={currentDeletingProduct}
              showExtendedInfo={showExtendedInfo}
              showMediumInfo={showMediumInfo}
              isSmallScreen={isSmallScreen}
              //update: Pass categories and subcategories to ProductTableRow
              categories={categories}
              subcategories={subcategories}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;