import React, { useCallback, memo, useState, useEffect } from 'react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from './components/shop_cover_image/ShopCoverImage.jsx';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import ShopMap from './components/shop_map/ShopMap.jsx';
import ShopHeader from './components/ShopHeader.jsx';
import MinimizedCard from './components/MinimizedCard.jsx';
import ShopDetails from './components/ShopDetails.jsx';
import useScreenSize from './components/useScreenSize.js';
import ShopCardUtils from './ShopCardUtils.jsx';
import ShopValorationForm from './components/shop_valoration/ShopValorationForm.jsx';
import UserInfoCard from '../../../user_info_card/UserInfoCard.jsx';
import { ShoppingCart } from 'lucide-react';
import axiosInstance from '../../../../utils/app/axiosConfig.js';

const ShopCard = ({ shop, isClickable = false, hideActions = false, onOrder = null }) => {
  const [minimized, setMinimized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showValorationForm, setShowValorationForm] = useState(false);
  const [valorationKey, setValorationKey] = useState(0);
  //update: Add state for shop owner info
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const isSmallScreen = useScreenSize(768);
  
  const { currentUser } = useAuth();
  const { setSelectedShop, setShowShopCreationForm } = useShop();
  const { setShowProductManagement, setShowShopStore, setSelectedShopForStore } = useUI();
  
  const { formatTime, formatShopType, checkHasContinuousSchedule, formatOpenDays, isShopOpen } = ShopCardUtils();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkOpenStatus = () => {
      setIsOpen(isShopOpen(shop));
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);

    return () => clearInterval(interval);
  }, [shop, isShopOpen]);

  //update: Function to fetch shop owner data using correct field name
// In ShopCard.jsx, modify the fetchOwnerData function:

const fetchOwnerData = useCallback(async () => {
  if (!shop?.id_user) {
    console.error('No shop owner ID available');
    return;
  }

  setLoadingOwner(true);
  try {
    console.log('Fetching owner data for user ID:', shop.id_user);
    
    // Use the correct endpoint from user_api_router.js
    const response = await axiosInstance.post('/user/byId', {
      id_user: shop.id_user
    });

    if (response.data && response.data.data) {
      setOwnerData(response.data.data);
      console.log('Owner data fetched successfully:', response.data.data);
    } else {
      console.error('Owner not found');
    }
  } catch (error) {
    console.error('Error fetching owner data:', error);
  } finally {
    setLoadingOwner(false);
  }
}, [shop?.id_user]);

  //update: Handle showing owner info
  const handleShowOwnerInfo = useCallback(async (e) => {
    e.stopPropagation();
    
    if (!ownerData && !loadingOwner) {
      await fetchOwnerData();
    }
    
    setShowOwnerInfo(true);
    setShowMap(false);
    setShowValorationForm(false);
  }, [ownerData, loadingOwner, fetchOwnerData]);

  //update: Handle closing owner info
  const handleCloseOwnerInfo = useCallback(() => {
    setShowOwnerInfo(false);
  }, []);

  // Event handlers
  const toggleMinimized = useCallback(() => {
    setMinimized(prevState => !prevState);
    
    if (!minimized === false) {
      setShowMap(false);
      setShowValorationForm(false);
      setShowOwnerInfo(false);
    }
  }, [minimized]);

  const toggleMap = useCallback((e) => {
    e.stopPropagation();
    setShowMap(prev => !prev);
    if (!showMap) {
      setShowValorationForm(false);
      setShowOwnerInfo(false);
    }
  }, [showMap]);

  const handleUpdateShop = useCallback((e) => {
    e.stopPropagation(); 
    
    console.log('ShopCard - handleUpdateShop called with shop:', shop);
    
    setSelectedShop(shop);
    setShowShopCreationForm(true);
    setShowProductManagement(false);
  }, [shop, setSelectedShop, setShowShopCreationForm, setShowProductManagement]);

  const handleToggleValoration = useCallback((e) => {
    e.stopPropagation();
    setShowValorationForm(prev => !prev);
    if (!showValorationForm) {
      setShowMap(false);
      setShowOwnerInfo(false);
      setValorationKey(prev => prev + 1);
    }
  }, [showValorationForm]);

  const handleReport = useCallback((e) => {
    e.stopPropagation();
    console.log('Report shop:', shop.id_shop);
  }, [shop]);

  const handleOpenStore = useCallback((e) => {
    if (e) e.stopPropagation();
    
    console.log('ShopCard - handleOpenStore called for shop:', shop);
    
    if (onOrder && typeof onOrder === 'function') {
      onOrder(shop);
    } else {
      setSelectedShop(shop);
      setSelectedShopForStore(shop);
      setShowShopStore(true);
    }
  }, [shop, onOrder, setSelectedShop, setSelectedShopForStore, setShowShopStore]);

  const handleValorationClose = useCallback(() => {
    setShowValorationForm(false);
  }, []);

  const handleValorationSuccess = useCallback(() => {
    console.log('Valoration submitted successfully');
    setShowValorationForm(false);
  }, []);

  // Memoized values
  const isSeller = currentUser?.type_user === 'seller';
  const canValorate = currentUser?.type_user === 'user';
  const canMakeOrder = currentUser?.type_user === 'user';
  const hasContinuousSchedule = checkHasContinuousSchedule(shop);
  
  const shopTypeFormatted = formatShopType(shop);

  return (
    <>
    <div className={`${styles.shopCardWrapper} ${showMap && !minimized && !isSmallScreen ? styles.withMap : ''}`}>
     
      <div 
        className={`${styles.container} ${minimized ? styles.minimized : ''} ${showValorationForm ? styles.expanded : ''}`}
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
              handleToggleValoration={handleToggleValoration}
              handleReport={handleReport}
              handleShowOwnerInfo={handleShowOwnerInfo}
              isSeller={isSeller}
              canValorate={canValorate}
              showValorationForm={showValorationForm}
              showOwnerInfo={showOwnerInfo}
            />
            <ShopCoverImage id_shop={shop.id_shop} />
            <ShopDetails 
              shop={shop}
              formatTime={formatTime}
              formatShopType={shopTypeFormatted}
              hasContinuousSchedule={hasContinuousSchedule}
              formatOpenDays={formatOpenDays}
              isOpen={isOpen}
            />
            
            {canMakeOrder && !hideActions && (
              <div className={styles.orderButtonContainer}>
                <button
                  onClick={handleOpenStore}
                  className={styles.orderButton}
                  type="button"
                >
                  <ShoppingCart size={18} />
                  <span>Hacer Pedido</span>
                </button>
              </div>
            )}
            
            {showValorationForm && (
              <div className={styles.valorationFormContainer}>
                <ShopValorationForm 
                  key={valorationKey}
                  shop={shop}
                  onClose={handleValorationClose}
                  onSubmitSuccess={handleValorationSuccess}
                />
              </div>
            )}
          </>
        )}
      </div>

      {showMap && !minimized && (
        <div 
          className={styles.mapWrapper} 
        >
          <ShopMap 
            shop={shop} 
            isSmallScreen={isSmallScreen} 
            onBack={() => setShowMap(false)}
          />
        </div>    
      )}
    </div>
    
    {/*update: Render UserInfoCard for shop owner */}
    {showOwnerInfo && ownerData && (
      <UserInfoCard 
        userData={ownerData}
        onClose={handleCloseOwnerInfo}
        isOwnerView={true}
      />
    )}
    </>
  );
};

export default memo(ShopCard);