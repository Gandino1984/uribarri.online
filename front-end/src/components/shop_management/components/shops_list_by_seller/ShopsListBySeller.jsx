import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import { useTransition, useSpring, animated } from '@react-spring/web';
import styles from '../../../../../../public/css/ShopsListBySeller.module.css';
import ShopsListBySellerUtils from './ShopsListBySellerUtils.jsx';
import { HousePlus } from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';
import { shopsListAnimations } from '../../../../utils/animation/transitions.js';

import ShopLimitIndicator from './components/ShopLimitIndicator';
import ShopsTable from './components/ShopsTable';

const ShopsListBySeller = () => {
  // State for animation control
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // 📱 UPDATE: Added state to track screen width for responsive layout decisions
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Using split context hooks instead of AppContext
  const { currentUser } = useAuth();
  const { shops, selectedShop } = useShop();
  const { showProductManagement } = useProduct();

  // Get shop limits directly from environment variables
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

  // 📱 UPDATE: Added event listener for screen resize to update responsive layout
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

  // Log selected shop updates for debugging
  useEffect(() => {
    if (selectedShop) {
      console.log('Selected shop updated:', selectedShop.id_shop);
    }
  }, [selectedShop]);

  return (
    <div className={styles.container}>
      {/* 📱 UPDATE: Fixed content wrapper to ensure proper containment on small screens */}
      <div className={styles.content}>
        {/* Header with title and add button - now with animation */}
        <div className={styles.headerContainer}>
          <animated.div style={titleAnimation} className={styles.header}>
            <h1 className={styles.title}>
              Mis comercios
            </h1>
            
            <button 
              onClick={() => handleAddShop(shopLimit)}
              className={`${styles.addButton} ${shopCount >= shopLimit ? styles.disabledButton : ''}`}
              title="Crear nuevo comercio"
              disabled={shopCount >= shopLimit}
            >
              <span>Crear</span>
              <HousePlus size={screenWidth > 480 ? 16 : 20} />
            </button>
          </animated.div>
        
          {/* Shop limit indicator */}
          <animated.div style={titleAnimation}>
            <ShopLimitIndicator 
              shopCount={shopCount} 
              shopLimit={shopLimit} 
              isUserSponsor={!!currentUser?.category_user} 
            />
          </animated.div>
        </div>

        {/* 📱 UPDATE: Improved shop management container with explicit width constraints */}
        <div className={styles.shopManagementContainer}>
          {/* Table container with slide animation and better containment */}
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

          {/* Shop card container with animation */}
          {selectedShop && shouldShowShopCard() && !showProductManagement && (
            <animated.div style={cardAnimation} className={styles.shopCardContainer}>
              <div className={styles.shopCardInstructions}>
                <p>Haz click nuevamente en la tienda para administrar sus productos</p>
              </div>
              <ShopCard shop={selectedShop} />
            </animated.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopsListBySeller;