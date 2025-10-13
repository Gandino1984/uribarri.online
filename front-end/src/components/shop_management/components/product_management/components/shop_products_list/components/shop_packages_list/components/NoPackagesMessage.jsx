import React from 'react';
import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';

const NoPackagesMessage = ({ packages }) => {
  return (
    <p className={styles.noProducts}>
      {packages.length === 0 
        ? "No hay paquetes disponibles. Añade un paquete para comenzar."
        : "No se encontraron paquetes que coincidan con tu búsqueda."}
    </p>
  );
};

export default NoPackagesMessage;