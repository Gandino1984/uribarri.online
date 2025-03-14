import React, { useContext, useEffect } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopsListBySeller.module.css';
import { ShopsListBySellerFunctions } from './ShopsListBySellerFunctions.jsx';
import { Box } from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';

// UPDATE: Importar los componentes extraídos
import ShopLimitIndicator from './ShopLimitIndicator';
import ShopsTable from './ShopsTable';

const ShopsListBySeller = () => {
  const { 
    shops, 
    selectedShop, 
    currentUser,
    showProductManagement
  } = useContext(AppContext);

  const { 
    fetchUserShops,
    handleSelectShop,
    handleDeleteShop,
    handleAddShop,
    handleUpdateShop,
    shopCount,
    shopLimit,
    isShopSelected,
    shouldShowShopCard
  } = ShopsListBySellerFunctions();

  // Cargar tiendas cuando sea necesario
  useEffect(() => {
    if ((!shops || shops.length === 0) && currentUser?.id_user) {
      fetchUserShops();
    }
  }, [currentUser?.id_user, fetchUserShops, shops]);

  // Registrar actualizaciones de la tienda seleccionada para debugging
  useEffect(() => {
    if (selectedShop) {
      console.log('Selected shop updated:', selectedShop.id_shop);
    }
  }, [selectedShop]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Cabecera con título y botón de añadir */}
          <div className={styles.headerContainer}>
              <div className={styles.header}>
                  <h1 className={styles.title}>
                      Mis comercios
                  </h1>
                  
                  <button 
                    onClick={handleAddShop}
                    className={`${styles.addButton} ${shopCount >= shopLimit ? styles.disabledButton : ''}`}
                    title="Crear nuevo comercio"
                    disabled={shopCount >= shopLimit}
                  >
                      Crear
                      <Box size={16} />
                  </button>
              </div>
            
              {/* Indicador de límite de tiendas */}
              <ShopLimitIndicator 
                shopCount={shopCount} 
                shopLimit={shopLimit} 
                isUserSponsor={!!currentUser?.category_user} 
              />
        </div>

        <div className={styles.shopManagementContainer}>
          <div className={styles.tableContainer}>
              {/* Tabla de tiendas */}
              <ShopsTable 
                shops={shops}
                isShopSelected={isShopSelected}
                handleSelectShop={handleSelectShop}
                handleUpdateShop={handleUpdateShop}
                handleDeleteShop={handleDeleteShop}
              />

              {/* Vista previa de la tarjeta de tienda - usando ShopCard directamente */}
              {selectedShop && shouldShowShopCard() && !showProductManagement && (
                <div className={styles.shopCardContainer}>
                    {/* to-do: turn into a info card */}
                    <div className={styles.shopCardInstructions}>
                        <p>Haz click nuevamente en la tienda para administrar sus productos</p>
                    </div>
                    <ShopCard shop={selectedShop} />
                </div>
              )}
          </div>            
        </div>
      </div>
    </div>
  );
};

export default ShopsListBySeller;