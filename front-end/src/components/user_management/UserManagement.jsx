import React, { useContext, useEffect } from 'react';
import AppContext from '../../app_context/AppContext.js';
import ShopTypeButton from './ShopTypeButton.jsx';
import ShopsByType from './shops_by_type/ShopsByType.jsx'; 
import styles from '../../../../public/css/UserManagement.module.css';
import { UserManagementFunctions } from './UserManagementFunctions.jsx';

const UserManagement = () => {
  const { 
    selectedShopType, shopTypes 
  } = useContext(AppContext);

  const { handleBusinessTypeSelect, fetchShopTypes } = UserManagementFunctions();

  // Fetch shop types when component mounts
  useEffect(() => {
    fetchShopTypes();
  }, []);


  if (selectedShopType) {
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