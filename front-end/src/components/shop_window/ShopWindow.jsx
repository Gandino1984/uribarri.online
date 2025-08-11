import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import ShopCard from '../shop_management/components/shop_card/ShopCard.jsx';
import OButton from '../Obutton/Obutton.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';
import styles from '../../../../public/css/ShopWindow.module.css';

const ShopWindow = () => {
  const { currentUser } = useAuth();
  const { 
    setShowShopWindow, 
    setShowShopManagement,
    setShowShopStore,
    setSelectedShopForStore,
    setShowLandingPage
  } = useUI();
  const { shops, setShops } = useShop();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load all shops when component mounts
  useEffect(() => {
    fetchAllShops();
  }, []);

  const fetchAllShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/shop');
      
      if (response.data && !response.data.error) {
        setShops(response.data.data || []);
      } else {
        setError(response.data.error || 'Error al cargar los comercios');
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Error al cargar los comercios');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    // Hide ShopWindow and show LoginRegisterForm
    setShowShopWindow(false);
    setShowLandingPage(false);
    // This will trigger the LoginRegisterForm to show
  };
  
  //update: Handle shop card click
  const handleShopClick = (shop) => {
    if (!currentUser) {
      // If user is not logged in, redirect to login/register
      setShowShopWindow(false);
      setShowLandingPage(false);
      // Store the selected shop for after login
      setSelectedShopForStore(shop);
    } else if (currentUser.type_user === 'user') {
      // If user is logged in as 'user', show the shop store
      setSelectedShopForStore(shop);
      setShowShopWindow(false);
      setShowShopStore(true);
    }
    // If user is seller or other type, do nothing on click
  };

  const transitions = useTransition(shops, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    trail: 100,
    config: { tension: 200, friction: 25 }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Escaparate Comercial</h1>
        
        {/* {!currentUser && (
          <div>
            <button 
              onClick={handleRegisterClick}
              className={styles.registerButton}
            >
              Registrarse o iniciar
            </button>
          </div>
        )} */}
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Cargando comercios...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchAllShops} className={styles.retryButton}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {!loading && !error && shops.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>No hay comercios disponibles en este momento</p>
        </div>
      )}

      {!loading && !error && shops.length > 0 && (
        <div className={styles.shopsGrid}>
          {transitions((style, shop) => 
            shop && (
              <animated.div 
                key={shop.id_shop} 
                style={style} 
                className={styles.shopCardWrapper}
              >
                {/* update: Wrap ShopCard in a clickable div */}
                <div 
                  onClick={() => handleShopClick(shop)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleShopClick(shop);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <ShopCard 
                    shop={shop} 
                    isClickable={false} // Disable internal card functionality
                    hideActions={true} // Hide action buttons
                  />
                </div>
              </animated.div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ShopWindow;