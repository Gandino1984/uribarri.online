import React, { useContext, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopsListBySeller.module.css';
import { ShopsListBySellerFunctions } from './ShopsListBySellerFunctions.jsx';
import { Box, Trash2, Edit, AlertCircle } from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';

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

  // UPDATE: Controlar cuándo se hacen las llamadas a la API
  useEffect(() => {
    console.log('ShopsListBySeller component mounted - checking if fetch is needed');
    // Solo hacer la llamada si no hay tiendas cargadas o si el usuario cambió
    if ((!shops || shops.length === 0) && currentUser?.id_user) {
      console.log('Fetching shops because none exist or user changed');
      fetchUserShops();
    }
  }, [currentUser?.id_user, fetchUserShops, shops]); // UPDATE: Incluidas todas las dependencias

  // UPDATE: Limitar los logs a lo esencial
  useEffect(() => {
    if (selectedShop) {
      console.log('Selected shop updated:', selectedShop.id_shop);
    }
  }, [selectedShop]);


  // Función para mostrar información sobre el límite de tiendas
  const renderShopLimitInfo = () => {
    // Determinar el color del indicador basado en cuán cerca está el usuario del límite
    const percentUsed = (shopCount / shopLimit) * 100;
    let statusColor = 'green';
    
    if (percentUsed >= 90) {
      statusColor = 'red';
    } else if (percentUsed >= 70) {
      statusColor = 'orange';
    }

    
    return (
      <div className={styles.shopLimitInfo}>
        <div className={styles.limitHeader}>
          <AlertCircle size={16} color={statusColor}/>
          <span>Límite de comercios: {shopCount} de {shopLimit}</span>
        </div>
        {!currentUser?.category_user && shopCount >= shopLimit * 0.7 && (
          <p className={styles.upgradeMessage}>
            Conviértete en sponsor para aumentar tu límite a 5 comercios.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
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
                Nuevo
                <Box size={16} />
              </button>
          </div>
          
          {/* Mostrar indicador de límite de tiendas */}
          {renderShopLimitInfo()}
        </div>

        {(!shops || shops.length === 0) ? (
          <div className={styles.messageNoShops}>
            No tienes comercios registrados. ¡Agrega uno para comenzar!
          </div>
        ) : (
          <div className={styles.shopManagementContainer}>
            <div className={styles.tableContainer}>
            
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th className={styles.tableHeaderCell}></th>
                    <th className={styles.tableHeaderCell}>Nombre</th>
                    <th className={styles.tableHeaderCell}>Ubicación</th>
                    <th className={styles.tableHeaderCell}>Tipo</th>
                    <th className={styles.tableHeaderCell}>Subtipo</th>
                    <th className={styles.tableHeaderCell}>Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr 
                      key={shop.id_shop} 
                      className={`${styles.tableRow} ${isShopSelected(shop.id_shop) ? styles.selectedRow : ''}`}
                      onClick={() => handleSelectShop(shop)}
                    >
                      <td className={styles.actionsCell}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateShop(shop);
                          }}
                          className={styles.updateButton}
                          title="Actualizar comercio"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShop(shop.id_shop);
                          }}
                          className={styles.deleteButton}
                          title="Eliminar comercio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className={styles.tableCell}>{shop.name_shop}</td>
                      <td className={styles.tableCell}>{shop.location_shop}</td>
                      <td className={styles.tableCell}>{shop.type_shop}</td>
                      <td className={styles.tableCell}>{shop.subtype_shop}</td>
                      <td className={styles.tableCell}>{shop.calification_shop}/5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedShop && shouldShowShopCard() && !showProductManagement && (
              <div className={styles.shopCardContainer}>
                <ShopCard shop={selectedShop} />
                <div className={styles.shopCardInstructions}>
                  <p>Haz click nuevamente en la tienda para administrar sus productos</p>
                </div>
              </div>
            )}
            </div>            
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsListBySeller;