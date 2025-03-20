import React from 'react';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ProductTableHeader = () => {
  return (
    <tr className={styles.tableHeader}>
      <th className={styles.tableHeaderCell}>Acciones</th>
      <th className={styles.tableHeaderCell}>Imagen</th>
      <th className={styles.tableHeaderCell}>Nombre</th>
      <th className={styles.tableHeaderCell}>Precio</th>            
      <th className={styles.tableHeaderCell}>Tipo</th>
      <th className={styles.tableHeaderCell}>Sub-tipo</th>
      <th className={styles.tableHeaderCell}>País de Origen</th>
      <th className={styles.tableHeaderCell}>Localidad</th>
      <th className={styles.tableHeaderCell}>Temporada</th>
      <th className={styles.tableHeaderCell}>Descuento</th>
      <th className={styles.tableHeaderCell}>Total Vendidos</th>
      <th className={styles.tableHeaderCell}>Segunda Mano</th>
      <th className={styles.tableHeaderCell}>Más Información</th>
      <th className={styles.tableHeaderCell}>Caducidad AAAA-MM-DD</th>
      <th className={styles.tableHeaderCell}>Excedente</th>
    </tr>
  );
};

export default ProductTableHeader;