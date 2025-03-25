import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import styles from '../../../../../../public/css/ShopsListBySeller.module.css';
import ShopsListBySellerUtils from './ShopsListBySellerUtils.jsx';
import { Box } from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';

import ShopLimitIndicator from './components/ShopLimitIndicator';
import ShopsTable from './components/ShopsTable';

const ShopsListBySeller = () => {
  // UPDATE: Using split context hooks instead of AppContext
  const { currentUser } = useAuth();
  const { shops, selectedShop } = useShop();
  const { showProductManagement } = useProduct();

  // UPDATE: Get shop limits directly from environment variables
  const maxSponsorShops = parseInt(import.meta?.env?.VITE_MAX_SPONSOR_SHOPS || '3');
  const maxRegularShops = parseInt(import.meta?.env?.VITE_MAX_REGULAR_SHOPS || '1');
  
  // Calculate appropriate limit based on user's category
  const shopLimit = useMemo(() => {
    return currentUser?.category_user ? maxSponsorShops : maxRegularShops;
  }, [currentUser?.category_user, maxSponsorShops, maxRegularShops]);

  const { 
    fetchUserShops,
    handleSelectShop,
    handleDeleteShop,
    handleAddShop,
    handleUpdateShop,
    shopCount,
    isShopSelected,
    shouldShowShopCard
  } = ShopsListBySellerUtils();

  // Load shops when necessary
  useEffect(() => {
    if ((!shops || shops.length === 0) && currentUser?.id_user) {
      fetchUserShops();
    }
  }, [currentUser?.id_user, fetchUserShops, shops]);

  // Log selected shop updates for debugging
  useEffect(() => {
    if (selectedShop) {
      console.log('Selected shop updated:', selectedShop.id_shop);
    }
  }, [selectedShop]);

  return (
    <div className={styles.container}>
      {/* Content with proper containment */}
      <div className={styles.content}>
        {/* Header with title and add button */}
        <div className={styles.headerContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Mis comercios
            </h1>
            
            <button 
              onClick={() => handleAddShop(shopLimit)}
              className={`${styles.addButton} ${shopCount >= shopLimit ? styles.disabledButton : ''}`}
              title="Crear nuevo comercio"
              disabled={shopCount >= shopLimit}
            >
              Crear
              <Box size={16} />
            </button>
          </div>
        
          {/* Shop limit indicator */}
          <ShopLimitIndicator 
            shopCount={shopCount} 
            shopLimit={shopLimit} 
            isUserSponsor={!!currentUser?.category_user} 
          />
        </div>

        {/* Improved shop management container */}
        <div className={styles.shopManagementContainer}>
          {/* Table container with proper scrolling containment */}
          <div className={styles.tableContainer}>
            <ShopsTable 
              shops={shops}
              isShopSelected={isShopSelected}
              handleSelectShop={handleSelectShop}
              handleUpdateShop={handleUpdateShop}
              handleDeleteShop={handleDeleteShop}
            />
          </div>

          {/* Shop card container now properly contained */}
          {selectedShop && shouldShowShopCard() && !showProductManagement && (
            <div className={styles.shopCardContainer}>
              <div className={styles.shopCardInstructions}>
                <p>Haz click nuevamente en la tienda para administrar sus productos</p>
              </div>
              <ShopCard shop={selectedShop} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopsListBySeller;