import React, { useEffect, useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopsByType.module.css';
import UserProductsList from '../../user_management/user_product_management/user_products_list/UserProductsList.jsx'; 
import { ShopsByTypeFunctions } from './ShopsByTypeFunctions.jsx';

const ShopsByType = () => {
  const { 
    shopType, shops,
    error, selectedShop, setSelectedShop,
  } = useContext(AppContext);

  const { 
    handleShopSelect,
    fetchShopsByType 
  } = ShopsByTypeFunctions();

  useEffect(() => {
    console.log('-> ShopsByType.jsx - error = ', error);
  }, [error]);  

  useEffect(() => {
    setSelectedShop(null);
    fetchShopsByType();
  }, [shopType]);

  useEffect(() => {
    console.log('-> ShopsByType.jsx - Shops state = ', shops);
  }, [shops]);

  return (
    <div className={styles.container}>
        {selectedShop ? (
          <UserProductsList />
        ) : (
          <div>
            {!Array.isArray(shops) || shops.length === 0 ? (
              <p>No hay {shopType} shops disponibles.</p>
            ) : (
              <div className={styles.list}>
                {shops.map(shop => {
                  // Ensure shop has required properties before rendering
                  if (!shop || !shop.id_shop) return null;
                  
                  return (
                    <div 
                      key={shop.id_shop} 
                      className={styles.shop}
                      onClick={() => handleShopSelect(shop)}
                    >
                        <div className={styles.shopInfo}>
                            <h3 className={styles.registerName}>
                              {shop.name_shop || 'Unnamed Shop'}
                            </h3>
                            <p className={styles.registerLocation}>
                              Ubicación: {shop.location_shop || 'No location'}
                            </p>
                            <p className={styles.registerCalification}>
                              Calificación: {shop.calification_shop || 'No disponible'}/5
                            </p>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default ShopsByType;