import React from 'react';
import styles from '../../../../../../../../public/css/ShopProductsList.module.css';

const ProductsCount = ({ displayedProducts, selectedProducts }) => {
  return (
    <p className={styles.productsCount}>
      Productos mostrados: {displayedProducts.length}
      {selectedProducts.size > 0 && ` | Seleccionados: ${selectedProducts.size}`}
    </p>
  );
};

export default ProductsCount;