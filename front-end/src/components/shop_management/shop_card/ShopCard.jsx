import React, { useState, useContext, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { MapPinned, Minimize2, Maximize2, Edit, Store, Map, ArrowLeft, Clock } from 'lucide-react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from '../shop_card/shop_cover_image/ShopCoverImage.jsx';
import AppContext from '../../../app_context/AppContext.js';
import ShopMap from './shop_map/ShopMap.jsx';

const ShopCard = ({ shop }) => {
  // Estado para controlar si la tarjeta está minimizada o no
  const [minimized, setMinimized] = useState(false);
  // UPDATE: Added state to control map visibility
  const [showMap, setShowMap] = useState(false);
  // UPDATE: Added state to track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Get currentUser and functions needed for shop update
  const { 
    currentUser,
    setSelectedShop,
    setShowShopCreationForm,
    setShowProductManagement
  } = useContext(AppContext);

  // UPDATE: Check screen size and update state when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if the current user is a seller
  const isSeller = currentUser?.type_user === 'seller';

  // Function to handle edit button click
  const handleUpdateShop = (e) => {
    e.stopPropagation(); // Prevent any parent click handlers from firing
    
    console.log('ShopCard - handleUpdateShop called with shop:', shop);
    
    // Set the selected shop
    setSelectedShop(shop);
    
    // Show the shop creation form (for editing) and hide product management
    setShowShopCreationForm(true);
    setShowProductManagement(false);
    
    console.log('Navigation states updated for edit: showShopCreationForm=true, showProductManagement=false');
  };

  // UPDATE: Enhanced function to toggle map visibility based on screen size
  const toggleMap = (e) => {
    e.stopPropagation(); // Prevent any parent click handlers from firing
    setShowMap(prev => !prev);
  };

  // Animación para la transición entre estados
  const cardAnimation = useSpring({
    from: { 
      opacity: 0,
      height: minimized ? 'auto' : '0px'
    },
    to: { 
      opacity: 1,
      height: minimized ? '50px' : 'auto' 
    },
    config: { tension: 280, friction: 20 }
  });

  // UPDATE: Enhanced animation for the card based on screen size and map visibility
  const cardContainerAnimation = useSpring({
    width: showMap && !isSmallScreen ? '60%' : '100%',
    display: isSmallScreen && showMap ? 'none' : 'block',
    config: { tension: 280, friction: 30 }
  });

  // UPDATE: Animation for map container based on screen size
  const mapContainerAnimation = useSpring({
    width: isSmallScreen ? '100%' : '40%',
    config: { tension: 280, friction: 30 }
  });

  const shopInfoAnimation = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: { transform: 'translateY(0px)', opacity: 1 },
    config: { tension: 280, friction: 20 },
    delay: 120
  });

  const formatTime = (time) => {
    if (!time) return '00:00';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Función para alternar entre minimizado y maximizado
  const toggleMinimized = () => {
    setMinimized(prevState => !prevState);
  };

  // UPDATE: Helper function to format shop type and subtype
  const formatShopType = () => {
    if (!shop?.type_shop) return 'No especificado';
    
    if (shop?.subtype_shop) {
      return `${shop.type_shop} - ${shop.subtype_shop}`;
    }
    
    return shop.type_shop;
  };

  // UPDATE: Check if shop has a continuous schedule (no rest period)
  const hasContinuousSchedule = !shop?.morning_close || !shop?.afternoon_open;

  // UPDATE: Container style to handle flex layout when map is shown
  const containerStyle = {
    display: 'flex',
    flexDirection: isSmallScreen ? 'column' : 'row',
    width: '100%',
    position: 'relative'
  };

  return (
    <div style={containerStyle}>
      <animated.div style={cardContainerAnimation} className={`${styles.container} ${minimized ? styles.minimized : ''} ${styles.responsiveContainer}`}>
        {/* Botón minimizado que aparece cuando la tarjeta está minimizada */}
        {minimized ? (
          <animated.div style={cardAnimation} className={styles.minimizedCard} onClick={toggleMinimized}>
            <div className={styles.minimizedContent}>
              <span className={styles.minimizedText}>Mi tienda</span>
              <Maximize2 size={18} className={styles.toggleIcon} />
            </div>
          </animated.div>
        ) : (
          <>
            <div className={styles.headerControls}>
              {/* Botón para minimizar la tarjeta */}
              <button 
                className={styles.minimizeButton} 
                onClick={toggleMinimized}
                title="Minimizar tarjeta"
              >
                <Minimize2 size={16} />
              </button>
              
              {/* Edit button for sellers only */}
              {isSeller && (
                <button 
                  className={styles.minimizeButton} 
                  onClick={handleUpdateShop}
                  title="Editar comercio"
                  style={{ marginLeft: '8px' }}
                >
                  <Edit size={16} />
                </button>
              )}
              
              {/* UPDATE: Map button */}
              <button 
                className={styles.minimizeButton}
                onClick={toggleMap}
                title={showMap ? "Ocultar mapa" : "Mostrar ubicación en mapa"}
                style={{ marginLeft: '8px' }}
              >
                <Map size={16} />
              </button>
            </div>
            <ShopCoverImage id_shop={shop.id_shop} />
            
            <animated.div style={shopInfoAnimation} className={styles.infoContainer}>
              <div className={styles.header}>
                <h2 className={styles.title}>{shop?.name_shop}</h2>
                <p className={styles.rating}>
                  Calificación: {shop?.calification_shop || 'No disponible'}/5
                </p>
              </div>
              {/* UPDATE: Added shop type information */}
              <p className={styles.shopType}>
                <Store size={16} className={styles.shopTypeIcon} />
                {formatShopType()}
              </p>
              <p className={styles.location}>
                <MapPinned size={16} className={styles.locationIcon} />
                {shop?.location_shop}
              </p>
              <div className={styles.scheduleContainer}>
                <div className={styles.scheduleInfo}>
                  {/* UPDATE: Display different schedule based on type */}
                  {hasContinuousSchedule ? (
                    // Continuous schedule (no rest period)
                    <span className={styles.scheduleTime}>
                      <Clock size={16} className={styles.scheduleIcon} />
                      Horario: {formatTime(shop?.morning_open)} - {formatTime(shop?.afternoon_close)}
                    </span>
                  ) : (
                    // Schedule with rest period
                    <>
                      <span className={styles.scheduleTime}>
                        Mañana: {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
                      </span>
                      <span className={styles.scheduleTime}>
                        Tarde: {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </animated.div>
          </>
        )}
      </animated.div>
      
      {/* UPDATE: Render map component when showMap is true, with back button on small screens */}
      {showMap && !minimized && (
        <ShopMap 
          shop={shop} 
          isSmallScreen={isSmallScreen} 
          onBack={() => setShowMap(false)}
          style={mapContainerAnimation}
        />
      )}
    </div>
  );
};

export default ShopCard;