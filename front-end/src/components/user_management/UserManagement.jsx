import React, { useContext, useEffect } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopTypeButton from './components/ShopTypeButton.jsx';
import ShopsByType from './components/shops_by_type/ShopsByType.jsx'; 
import styles from '../../../../public/css/UserManagement.module.css';
import { UserManagementUtils } from './UserManagementUtils.jsx';

const UserManagement = () => {
  const { 
    selectedShopType, shopTypes, shopType
  } = useContext(AppContext);

  const { handleBusinessTypeSelect, fetchShopTypes } = UserManagementUtils();

  // Fetch shop types when component mounts
  useEffect(() => {
    fetchShopTypes();
  }, []);

  // Si ya hay un tipo de tienda seleccionado, mostrar ShopsByType
  if (selectedShopType || shopType) {
    return <ShopsByType />;
  }

  return (
    <div className={styles.container}>
        <div className={styles.header}>
            <h2 className={styles.title}>
                Selecciona el tipo de comercio
            </h2>
        </div>
        <div className={styles.buttonsContainer}>
            {console.log('Rendering shop types:', shopTypes)}
            {shopTypes.map((shopType) => (
                <ShopTypeButton 
                    key={shopType} 
                    onClick={() => handleBusinessTypeSelect(shopType)}
                >
                    {shopType}
                </ShopTypeButton>
            ))}
        </div>
    </div>
  );
};

export default UserManagement;