import React from 'react';
import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';

const PackagesCount = ({ displayedPackages }) => {
  return (
    <p className={styles.productsCount}>
      Paquetes mostrados: {displayedPackages.length}
    </p>
  );
};

export default PackagesCount;