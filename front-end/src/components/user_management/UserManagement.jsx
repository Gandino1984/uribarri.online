import React, { useEffect } from 'react';
import { useShop } from '../../app_context/ShopContext.jsx';
import ShopTypeButton from './components/ShopTypeButton.jsx';
import ShopsByType from './components/shops_by_type/ShopsByType.jsx'; 
import styles from '../../../../public/css/UserManagement.module.css';
import { UserManagementUtils } from './UserManagementUtils.jsx';

const UserManagement = () => {
  // UPDATE: Using specialized context hooks instead of AppContext
  const { selectedShopType, shopTypes, shopType } = useShop();

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