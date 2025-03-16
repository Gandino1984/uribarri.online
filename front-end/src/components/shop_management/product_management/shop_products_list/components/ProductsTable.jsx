import React from 'react';
import ProductTableHeader from './ProductTableHeader';
import ProductTableRow from './ProductTableRow';
import styles from '../../../../../../../public/css/ShopProductsList.module.css';

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
  handleProductImageDoubleClick,
  currentDeletingProduct
}) => {
  return (
    <table className={styles.table}>
      <thead>
        <ProductTableHeader />
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
            handleProductImageDoubleClick={handleProductImageDoubleClick}
            formatDate={formatDate}
            formatSecondHand={formatSecondHand}
            currentDeletingProduct={currentDeletingProduct}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProductsTable;