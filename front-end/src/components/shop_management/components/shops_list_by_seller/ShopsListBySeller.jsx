import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useTransition, useSpring, animated } from '@react-spring/web';
import styles from '../../../../../../public/css/ShopsListBySeller.module.css';
import ShopsListBySellerUtils from './ShopsListBySellerUtils.jsx';
import { Plus } from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';
import { shopsListAnimations } from '../../../../utils/animation/transitions.js';

import ShopLimitIndicator from './components/ShopLimitIndicator';
import ShopsTable from './components/ShopsTable';

const ShopsListBySeller = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const { currentUser } = useAuth();
  const { shops, selectedShop } = useShop();
  const { showProductManagement } = useProduct();
  
  // 🔧 UPDATE: Added UI context to manage info messages for shop instructions
  const { setInfo, setShowInfoCard } = useUI();

  const maxSponsorShops = parseInt(import.meta?.env?.VITE_MAX_SPONSOR_SHOPS || '3');
  const maxRegularShops = parseInt(import.meta?.env?.VITE_MAX_REGULAR_SHOPS || '1');
  
  // Calculate appropriate limit based on user's category
  const shopLimit = useMemo(() => {
    return currentUser?.contributor_user ? maxSponsorShops : maxRegularShops;
  }, [currentUser?.contributor_user, maxSponsorShops, maxRegularShops]);

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

  // Using title animation from transitions file
  const titleAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? shopsListAnimations.titleAnimation.enter.transform 
      : shopsListAnimations.titleAnimation.from.transform,
    config: shopsListAnimations.titleAnimation.config
  });

  // Using table transition from transitions file
  const tableTransition = useTransition(isVisible && !isExiting, {
    from: shopsListAnimations.tableAnimation.from,
    enter: shopsListAnimations.tableAnimation.enter,
    leave: shopsListAnimations.tableAnimation.leave,
    config: shopsListAnimations.tableAnimation.config,
    onRest: () => {
      if (isExiting) {
        setIsVisible(false);
        setIsExiting(false);
      }
    }
  });

  // Using shop card animation from transitions file
  const cardAnimation = useSpring({
    opacity: selectedShop && shouldShowShopCard() && !showProductManagement 
      ? shopsListAnimations.shopCardAnimation.enter.opacity 
      : shopsListAnimations.shopCardAnimation.from.opacity,
    transform: selectedShop && shouldShowShopCard() && !showProductManagement 
      ? shopsListAnimations.shopCardAnimation.enter.transform 
      : shopsListAnimations.shopCardAnimation.from.transform,
    config: shopsListAnimations.shopCardAnimation.config
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load shops when necessary
  useEffect(() => {
    if ((!shops || shops.length === 0) && currentUser?.id_user) {
      fetchUserShops();
    }
  }, [currentUser?.id_user, fetchUserShops, shops]);

  // Handle visibility changes on mount/unmount
  useEffect(() => {
    // Component mounted
    setIsVisible(true);
    
    // Cleanup function for unmounting
    return () => {
      setIsExiting(true);
    };
  }, []);

  // 🔧 UPDATE: Show instruction message when component loads and there are shops
  useEffect(() => {
    if (shops && shops.length > 0 && isVisible) {
      setInfo(prevInfo => ({
        ...prevInfo,
        shopInstructions: "Haz doble click en un comercio para administrar sus productos"
      }));
      setShowInfoCard(true);
    }
  }, [shops, isVisible, setInfo, setShowInfoCard]);

  // Log selected shop updates for debugging
  useEffect(() => {
    if (selectedShop) {
      console.log('Selected shop updated:', selectedShop.id_shop);
    }
  }, [selectedShop]);

  return (
    <div className={`${styles.container} ${selectedShop && shouldShowShopCard() ? styles.expandedContainer : ''}`}>
      <div className={styles.content}>
        <div className={styles.headerContainer}>
          <animated.div style={titleAnimation} className={styles.header}>
            <h1 className={styles.title}>
              Mis comercios
            </h1>
            
            <button 
              onClick={() => handleAddShop(shopLimit)}
              className={`${styles.active} ${shopCount >= shopLimit ? styles.inactive : ''}`}
              title="Crear nuevo comercio"
              disabled={shopCount >= shopLimit}
            >
              <span>Crear</span>
              <Plus size={screenWidth > 480 ? 16 : 20} />
            </button>
          </animated.div>
        
          {/* Shop limit indicator */}
          <animated.div style={titleAnimation}>
            <ShopLimitIndicator 
              shopCount={shopCount} 
              shopLimit={shopLimit} 
              isUserSponsor={!!currentUser?.contributor_user} 
            />
          </animated.div>
        </div>

        <div className={styles.shopManagementContainer}>
          {tableTransition((style, show) => 
            show && (
              <animated.div style={{...style, width: '100%'}} className={styles.tableContainer}>
                <ShopsTable 
                  shops={shops}
                  isShopSelected={isShopSelected}
                  handleSelectShop={handleSelectShop}
                  handleUpdateShop={handleUpdateShop}
                  handleDeleteShop={handleDeleteShop}
                />
              </animated.div>
            )
          )}

          {selectedShop && shouldShowShopCard() && !showProductManagement && (
            <div className={styles.shopCardWrapper}>
              <animated.div style={cardAnimation} className={styles.shopCardContainer}>
                <ShopCard shop={selectedShop} />
              </animated.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopsListBySeller;