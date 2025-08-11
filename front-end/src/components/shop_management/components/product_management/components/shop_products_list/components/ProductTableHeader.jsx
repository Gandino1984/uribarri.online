import React from 'react';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ProductTableHeader = ({ showExtendedInfo, showMediumInfo, isSmallScreen }) => {
  // 📱 UPDATE: Added responsive column labels based on screen size
  return (
    <tr className={styles.tableHeader}>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Acc.' : 'Acciones'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Img' : 'Imagen'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Nom.' : 'Nombre'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? '€' : 'Precio'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Cat.' : 'Categoría'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Subcat.' : 'Subcategoría'}
      </th>
      {showMediumInfo && (
        <>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? 'País' : 'País'}
          </th>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? 'Loc.' : 'Localidad'}
          </th>
        </>
      )}
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Temp.' : 'Temporada'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Dto.' : 'Descuento'}
      </th>
      {showMediumInfo && (
        <>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? 'Vend.' : 'Vendidos'}
          </th>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? '2ª M.' : '2ª Mano'}
          </th>
        </>
      )}
      {showExtendedInfo && (
        <>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? 'Info' : 'Información'}
          </th>
          <th className={styles.tableHeaderCell}>
            {isSmallScreen ? 'Cad.' : 'Caducidad'}
          </th>
        </>
      )}
      {showMediumInfo && (
        <th className={styles.tableHeaderCell}>
          {isSmallScreen ? 'Exc.' : 'Excedente'}
        </th>
      )}
    </tr>
  );
};

export default ProductTableHeader;