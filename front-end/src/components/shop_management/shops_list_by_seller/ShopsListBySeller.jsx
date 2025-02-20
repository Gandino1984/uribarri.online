import React, { useContext, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopsListBySeller.module.css';
import { ShopsListBySellerFunctions } from './ShopsListBySellerFunctions.jsx';
import { Box, Trash2, Edit } from 'lucide-react';
import ConfirmationModal from '../../confirmation_modal/ConfirmationModal.jsx';

const ShopsListBySeller = () => {
  const { 
    shops, 
    selectedShop, 
    currentUser,
    setShowShopCreationForm,
    setSelectedShop
  } = useContext(AppContext);

  const { 
    handleSelectShop,
    handleDeleteShop,
    handleAddShop
  } = ShopsListBySellerFunctions();

  // Animation configuration
  const springProps = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(50px)'
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px)'
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  useEffect(() => {
    console.log('-> ShopsListBySeller.jsx - currentUser = ', currentUser);
    console.log('-> ShopsListBySeller.jsx - selectedShop = ', selectedShop);
  }, [currentUser, selectedShop]);

  useEffect(() => {
    console.log('Shops state updated:', shops);
  }, [shops]);

  const handleUpdateShop = (shop) => {
    setSelectedShop(shop);
    setShowShopCreationForm(true);
  };

  return (
    <animated.div style={springProps} className={styles.container}>
      <ConfirmationModal />
      <div className={styles.content}>
        <div className={styles.headerContainer}>
          <div className={styles.header}>
              <h1 className={styles.title}>
                Mis comercios
              </h1>
              
              <button 
                onClick={handleAddShop}
                className={styles.addButton}
                title="Crear nuevo comercio"
              >
                <span className={styles.buttonText}>Nuevo</span>
                <Box size={16} />
              </button>
          </div>
        </div>

        {shops.length === 0 ? (
          <div className={styles.messageNoShops}>
            No tienes comercios registrados. ¡Agrega uno para comenzar!
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableHeaderCell}></th>
                  <th className={styles.tableHeaderCell}>Nombre</th>
                  <th className={styles.tableHeaderCell}>Ubicación</th>
                  <th className={styles.tableHeaderCell}>Tipo</th>
                  <th className={styles.tableHeaderCell}>Subtipo</th>
                  <th className={styles.tableHeaderCell}></th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr 
                    key={shop.id_shop} 
                    className={styles.tableRow}
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
                    <td className={styles.tableCell}>{shop.subtype_shop}</td>
                    <td className={styles.tableCell}>{shop.type_shop}</td>
                    <td className={styles.tableCell}>{shop.calification_shop}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default ShopsListBySeller;