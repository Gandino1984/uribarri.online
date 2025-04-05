import React from 'react';
import styles from '../../../../../../../../../../../public/css/ShopPackagesList.module.css';

const PackageTableHeader = ({ isSmallScreen }) => {
  // 📱 Added responsive column labels based on screen size
  return (
    <tr className={styles.tableHeader}>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Acc.' : 'Acciones'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'ID' : 'ID'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Nom.' : 'Nombre'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Prod.' : 'Productos'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Creado' : 'Fecha Creación'}
      </th>
      <th className={styles.tableHeaderCell}>
        {isSmallScreen ? 'Estado' : 'Estado'}
      </th>
    </tr>
  );
};

export default PackageTableHeader;