import React, { useContext, useCallback, memo, useState } from 'react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from '../shop_card/shop_cover_image/ShopCoverImage.jsx';
import AppContext from '../../../app_context/AppContext.js';
import ShopMap from './shop_map/ShopMap.jsx';
import ShopHeader from './ShopHeader.jsx';
import MinimizedCard from './MinimizedCard.jsx';
import ShopDetails from './ShopDetails.jsx';
import useScreenSize from './useScreenSize.js';
import ShopCardFunctions from './ShopCardFunctions.jsx';


const ShopCard = ({ shop }) => {
  const [minimized, setMinimized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const isSmallScreen = useScreenSize(768);
  
  const { 
    currentUser,
    setSelectedShop,
    setShowShopCreationForm,
    setShowProductManagement
  } = useContext(AppContext);
  

  const { formatTime, formatShopType, checkHasContinuousSchedule } = ShopCardFunctions();

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

  return (
    // UPDATE: Use flex container with responsive classes to maintain consistent sizing
    <div className={isSmallScreen ? styles.responsiveContainerColumn : styles.responsiveContainerRow}>
      <div 
        className={`${styles.container} ${minimized ? styles.minimized : ''} ${styles.responsiveContainer}`}
        style={!isSmallScreen && !minimized && showMap ? { flex: '1 1 40%' } : {}}
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
      
      {showMap && !minimized && (
        <ShopMap 
          shop={shop} 
          isSmallScreen={isSmallScreen} 
          onBack={() => setShowMap(false)}
          style={!isSmallScreen ? { flex: '1 1 60%' } : {}}
        />
      )}
    </div>
  );
};

export default memo(ShopCard);