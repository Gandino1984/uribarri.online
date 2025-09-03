// front-end/src/components/shop_management/components/shops_list_by_seller/ShopsListBySeller.jsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../app_context/ProductContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useOrder } from '../../../../app_context/OrderContext.jsx';
import { useTransition, useSpring, animated } from '@react-spring/web';
import styles from '../../../../../../public/css/ShopsListBySeller.module.css';
import ShopsListBySellerUtils from './ShopsListBySellerUtils.jsx';
import { 
  Plus, 
  ShoppingBag, 
  Store, 
  MapPin, 
  Star, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  //update: Import ArrowLeft icon for back button
  ArrowLeft
} from 'lucide-react';
import ShopCard from '../shop_card/ShopCard.jsx';
import { shopsListAnimations } from '../../../../utils/animation/transitions.js';
import { formatImageUrl } from '../../../../utils/image/imageUploadService.js';

import ShopLimitIndicator from './components/ShopLimitIndicator';
import ShopOrdersList from '../shops_list_by_seller/components/shop_oders_list/ShopOrdersList.jsx';
import ShopTypeManagementForm from './components/ShopTypeManagementForm.jsx';

const ShopsListBySeller = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [expandedShop, setExpandedShop] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showTypeManagement, setShowTypeManagement] = useState(false);

  const { currentUser } = useAuth();
  const { shops, selectedShop } = useShop();
  const { showProductManagement } = useProduct();
  const { shopOrders, fetchShopOrders } = useOrder();
  const { 
    setInfo, 
    setShowInfoCard, 
    openImageModal,
    //update: Add navigation functions from UIContext
    setShowShopsListBySeller,
    setShowShopWindow,
    setShowLandingPage
  } = useUI();

  const maxSponsorShops = parseInt(import.meta?.env?.VITE_MAX_SPONSOR_SHOPS || '3');
  const maxRegularShops = parseInt(import.meta?.env?.VITE_MAX_REGULAR_SHOPS || '1');
  
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

  //update: Add handleBackToShopWindow function
  const handleBackToShopWindow = () => {
    console.log('Navigating from ShopsListBySeller back to ShopWindow');
    setShowShopsListBySeller(false);
    setShowShopWindow(true);
  };

  // Title animation
  const titleAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? shopsListAnimations.titleAnimation.enter.transform 
      : shopsListAnimations.titleAnimation.from.transform,
    config: shopsListAnimations.titleAnimation.config
  });

  // List animation
  const listTransition = useTransition(isVisible && !isExiting, {
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

  // Shop card animation
  const cardAnimation = useSpring({
    opacity: selectedShop && shouldShowShopCard() && !showProductManagement 
      ? shopsListAnimations.shopCardAnimation.enter.opacity 
      : shopsListAnimations.shopCardAnimation.from.opacity,
    transform: selectedShop && shouldShowShopCard() && !showProductManagement 
      ? shopsListAnimations.shopCardAnimation.enter.transform 
      : shopsListAnimations.shopCardAnimation.from.transform,
    config: shopsListAnimations.shopCardAnimation.config
  });

  // Individual shop card animations
  const shopCardsTransition = useTransition(shops, {
    keys: shop => shop.id_shop,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    config: { tension: 280, friction: 25 }
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

  useEffect(() => {
    if ((!shops || shops.length === 0) && currentUser?.id_user) {
      fetchUserShops();
    }
  }, [currentUser?.id_user, fetchUserShops, shops]);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsExiting(true);
    };
  }, []);

  useEffect(() => {
    if (shops && shops.length > 0 && isVisible) {
      setInfo(prevInfo => ({
        ...prevInfo,
        shopInstructions: "Haz click en un comercio para administrar sus productos"
      }));
      setShowInfoCard(true);
    }
  }, [shops, isVisible, setInfo, setShowInfoCard]);

  useEffect(() => {
    if (selectedShop?.id_shop) {
      fetchShopOrders(selectedShop.id_shop);
    }
  }, [selectedShop?.id_shop]);

  useEffect(() => {
    if (shopOrders && shopOrders.length > 0) {
      const pendingCount = shopOrders.filter(order => order.order_status === 'pending').length;
      setPendingOrdersCount(pendingCount);
    } else {
      setPendingOrdersCount(0);
    }
  }, [shopOrders]);

  useEffect(() => {
    if (!selectedShop?.id_shop) return;

    const interval = setInterval(() => {
      fetchShopOrders(selectedShop.id_shop);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedShop?.id_shop]);

  const toggleExpanded = (shopId) => {
    setExpandedShop(prev => prev === shopId ? null : shopId);
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className={styles.filledStar} fill="currentColor" />
        ))}
        {hasHalfStar && (
          <Star key="half" size={14} className={styles.halfStar} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className={styles.emptyStar} />
        ))}
        <span className={styles.ratingText}>({rating})</span>
      </span>
    );
  };

  const renderShopCard = (shop, style) => {
    const isSelected = isShopSelected(shop.id_shop);
    const isExpanded = expandedShop === shop.id_shop;
    
    return (
      <animated.div 
        key={shop.id_shop}
        style={style} 
        className={`${styles.shopCard} ${isSelected ? styles.selectedShop : ''}`}
      >
        <div 
          className={styles.shopCardHeader}
          onClick={() => handleSelectShop(shop)}
        >
          <div className={styles.shopMainInfo}>
            {/* Shop Image */}
            {shop.image_shop ? (
              <div 
                className={styles.shopImageContainer}
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(formatImageUrl(shop.image_shop));
                }}
              >
                <img 
                  src={formatImageUrl(shop.image_shop)} 
                  alt={shop.name_shop}
                  className={styles.shopImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className={`${styles.shopImageContainer} ${styles.noImage}`}>
                <Store size={20} className={styles.placeholderIcon} />
              </div>
            )}
            
            {/* Shop Info */}
            <div>
            <div className={styles.shopInfo}>
              <h4 className={styles.shopName}>{shop.name_shop}</h4>
              <div className={styles.shopMeta}>
                <span className={styles.shopType}>
                  {shop.type_shop}
                </span>
                {shop.subtype_shop && (
                  <span className={styles.shopSubtype}>
                    {shop.subtype_shop}
                  </span>
                )}
                <span className={styles.shopLocation}>
                  <MapPin size={14} />
                  {shop.location_shop}
                </span>
                <span className={styles.shopRating}>
                  {renderStarRating(shop.calification_shop || 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Shop Actions */}
          <div className={styles.shopActions}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateShop(shop);
              }}
              className={styles.actionButton}
              title="Actualizar comercio"
            >
              <Edit size={18} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteShop(shop.id_shop);
              }}
              className={styles.actionButton}
              title="Eliminar comercio"
            >
              <Trash2 size={18} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(shop.id_shop);
              }}
              className={styles.actionButton}
              title={isExpanded ? "Contraer" : "Expandir"}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
            </div>
            
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className={styles.shopDetails}>
            <ShopCard shop={shop} />
          </div>
        )}
      </animated.div>
    );
  };

  return (
    <div className={styles.container}>
      {/*update: Add back button at the top of the container */}
      <div className={styles.backButtonContainer}>
        <button 
          onClick={handleBackToShopWindow}
          className={styles.backButton}
          title="Volver al barrio"
        >
          <ArrowLeft size={20} />
          <span>Volver al barrio</span>
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.headerContainer}>
          <animated.div style={titleAnimation} className={styles.header}>
            <h1 className={styles.title}>
              Gestiona tus actividades comerciales aquí
            </h1>
            
            <div className={styles.headerButtons}>
              {currentUser?.contributor_user && (
                <button 
                  onClick={() => setShowTypeManagement(true)}
                  className={styles.active}
                  title="Gestionar tipos de comercio"
                >
                  <Tag size={screenWidth > 480 ? 16 : 20} />
                  <span>Tipos</span>
                </button>
              )}
              
              <button 
                onClick={() => handleAddShop(shopLimit)}
                className={`${styles.active} ${shopCount >= shopLimit ? styles.inactive : 'Crear'}`}
                title="Crear nuevo comercio"
                disabled={shopCount >= shopLimit}
              >
                <Store size={screenWidth > 480 ? 16 : 20} />
                <span>Nuevo</span>
              </button>
              
              {selectedShop && (
                <button 
                  onClick={() => setShowOrdersList(true)}
                  className={styles.active}
                  title="Ver pedidos del comercio"
                >
                  <ShoppingBag size={screenWidth > 480 ? 16 : 20} />
                  <span>Pedidos</span>
                  {pendingOrdersCount > 0 && (
                    <span className={styles.notificationBadge}>{pendingOrdersCount}</span>
                  )}
                </button>
              )}
            </div>
          </animated.div>
        
          
        </div>

        <div className={styles.shopManagementContainer}>
          {listTransition((style, show) => 
            show && (
              <animated.div style={{...style, width: '100%'}}>
                {(!shops || shops.length === 0) ? (
                  <div className={styles.messageNoShops}>
                    <Store size={48} />
                    <p>No tienes comercios registrados</p>
                    <p>¡Crea tu primer comercio para comenzar!</p>
                  </div>
                ) : (
                  <div className={styles.listHeaderContainer}>
                    <div className={styles.listHeader}>
                      <span className={styles.listTitle}>
                        Comercios{currentUser?.name_user ? ` de ${currentUser.name_user}` : ''} ({shops.length})
                      </span>
                    </div>
                    
                    <div className={styles.shopsList}>
                      {shopCardsTransition((style, shop) => 
                        shop && renderShopCard(shop, style)
                      )}
                    </div>

                    <animated.div style={titleAnimation}>
                        <ShopLimitIndicator 
                          shopCount={shopCount} 
                          shopLimit={shopLimit} 
                          isUserSponsor={!!currentUser?.contributor_user} 
                        />
                  </animated.div>
                  </div>
                )}
              </animated.div>
            )
          )}
        </div>
      </div>
      
      {showOrdersList && selectedShop && (
        <ShopOrdersList onClose={() => setShowOrdersList(false)} />
      )}
      
      {showTypeManagement && (
        <ShopTypeManagementForm onClose={() => setShowTypeManagement(false)} />
      )}
    </div>
  );
};

export default ShopsListBySeller;