import React, { useState, useContext } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { MapPinned, Minimize2, Maximize2, Edit, Store } from 'lucide-react';
import styles from '../../../../../public/css/ShopCard.module.css';
import ShopCoverImage from '../shop_card/shop_cover_image/ShopCoverImage.jsx';
import AppContext from '../../../app_context/AppContext.js';

const ShopCard = ({ shop }) => {
  // Estado para controlar si la tarjeta está minimizada o no
  const [minimized, setMinimized] = useState(false);
  
  // Get currentUser and functions needed for shop update
  const { 
    currentUser,
    setSelectedShop,
    setShowShopCreationForm,
    setShowProductManagement
  } = useContext(AppContext);

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

  return (
    <div className={`${styles.container} ${minimized ? styles.minimized : ''}`}>
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
                <span className={styles.scheduleTime}>
                  Mañana  {formatTime(shop?.morning_open)} - {formatTime(shop?.morning_close)}
                </span>
                <span className={styles.scheduleTime}>
                  Tarde  {formatTime(shop?.afternoon_open)} - {formatTime(shop?.afternoon_close)}
                </span>
              </div>
            </div>
          </animated.div>
        </>
      )}
    </div>
  );
};

export default ShopCard;