import React, { useCallback, memo, useState } from 'react';
import styles from '../../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from './components/shop_cover_image/ShopCoverImage.jsx';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import ShopMap from './components/shop_map/ShopMap.jsx';
import ShopHeader from './components/ShopHeader.jsx';
import MinimizedCard from './components/MinimizedCard.jsx';
import ShopDetails from './components/ShopDetails.jsx';
import useScreenSize from './components/useScreenSize.js';
import ShopCardUtils from './ShopCardUtils.jsx';

const ShopCard = ({ shop }) => {
  const [minimized, setMinimized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const isSmallScreen = useScreenSize(768);
  
  // UPDATE: Using split context hooks instead of AppContext
  const { currentUser } = useAuth();
  const { setSelectedShop, setShowShopCreationForm } = useShop();
  const { setShowProductManagement } = useProduct();
  
  const { formatTime, formatShopType, checkHasContinuousSchedule } = ShopCardUtils();

  // Event handlers
  const toggleMinimized = useCallback(() => {
    setMinimized(prevState => !prevState);
  }, []);

  const toggleMap = useCallback((e) => {
    e.stopPropagation(); 
    setShowMap(prev => !prev);
  }, []);

  const handleUpdateShop = useCallback((e) => {
    e.stopPropagation(); 
    
    console.log('ShopCard - handleUpdateShop called with shop:', shop);
    
    setSelectedShop(shop);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  }, [shop, setSelectedShop, setShowShopCreationForm, setShowProductManagement]);

  // Memoized values
  const isSeller = currentUser?.type_user === 'seller';
  const hasContinuousSchedule = checkHasContinuousSchedule(shop);
  
  // Memoize formatted shop type
  const shopTypeFormatted = formatShopType(shop);

  // Enhanced responsive layout with fullscreen mobile map
  return (
    <div className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
      <div 
        className={`${styles.container} ${minimized ? styles.minimized : ''}`}
        style={!isSmallScreen && !minimized && showMap ? { flex: '1 0 40%', maxWidth: '40%' } : {}}
      >
        {minimized ? (
          <MinimizedCard toggleMinimized={toggleMinimized} />
        ) : (
          <>
            <ShopHeader 
              minimized={minimized}
              toggleMinimized={toggleMinimized}
              handleUpdateShop={handleUpdateShop}
              toggleMap={toggleMap}
              isSeller={isSeller}
            />
            <ShopCoverImage id_shop={shop.id_shop} />
            <ShopDetails 
              shop={shop}
              formatTime={formatTime}
              formatShopType={shopTypeFormatted}
              hasContinuousSchedule={hasContinuousSchedule}
            />
          </>
        )}
      </div>
      
      {/* Improved map container with fullscreen mobile support */}
      {showMap && !minimized && (
        <div 
          className={styles.mapWrapper} 
          style={!isSmallScreen ? { flex: '1 0 60%', maxWidth: '60%' } : {}}
        >
          <ShopMap 
            shop={shop} 
            isSmallScreen={isSmallScreen} 
            onBack={() => setShowMap(false)}
          />
        </div>
      )}
    </div>
  );
};

export default memo(ShopCard);