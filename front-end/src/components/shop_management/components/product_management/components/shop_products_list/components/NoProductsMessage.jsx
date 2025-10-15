import React from 'react';
import styles from '../../../../../../../../css/ShopProductsList.module.css';

const NoProductsMessage = ({ products }) => {
  return (
    <p className={styles.noProducts}>
      {products.length === 0 
        ? "No hay productos disponibles. Añade un producto para comenzar."
        : "No se encontraron productos que coincidan con tu búsqueda."}
    </p>
  );
};

export default NoProductsMessage;