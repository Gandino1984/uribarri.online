import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Tag, Layers, Info, Check, XCircle, Percent, DollarSign} from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
//update: Import dedicated PackageCard styles
import styles from '../../../../../../../../../../css/PackageCard.module.css';
import ProductImage from '../../../../product_image/ProductImage.jsx';

const PackageCard = ({ package: packageItem, productDetails, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  //update: State for calculated prices
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  // Animation for the card
  const animation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };
  
  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Show animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  //update: Calculate total and discounted prices when component mounts or productDetails change
  useEffect(() => {
    if (productDetails && productDetails.length > 0) {
      const total = productDetails.reduce((sum, product) => {
        return sum + (parseFloat(product.price_product) || 0);
      }, 0);
      setTotalPrice(total);
      
      // Calculate discounted price
      const discount = parseInt(packageItem.discount_package) || 0;
      const discounted = total * (1 - discount / 100);
      setDiscountedPrice(discounted);
    }
  }, [productDetails, packageItem.discount_package]);
  
  // Ensure we have valid product details
  const validProductDetails = productDetails || [];
  
  return (
    <div className={styles.packageCardOverlay}>
      <animated.div style={animation} className={styles.packageCard}>
        <div className={styles.packageCardHeader}>
          <div className={styles.packageCardTitle}>
            <Package size={24} />
            <h2>{packageItem.name_package || 'Paquete sin nombre'}</h2>
          </div>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.packageCardBody}>
          <div className={styles.packageCardSection}>
            <h3 className={styles.sectionTitle}>
              <Info size={20} />
              <span>Información del Paquete</span>
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID de paquete:</span>
                <span className={styles.infoValue}>{packageItem.id_package}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID de comercio:</span>
                <span className={styles.infoValue}>{packageItem.id_shop}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Calendar size={16} />
                  <span>Fecha de Creación:</span>
                </span>
                <span className={styles.infoValue}>{formatDate(packageItem.creation_package)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Tag size={16} />
                  <span>Estado:</span>
                </span>
                <span className={styles.infoValue}>
                  {packageItem.active_package ? (
                    <span className={styles.statusActive}>
                      Activo
                      <Check size={16} color="green" />
                    </span>
                  ) : (
                    <span className={styles.statusInactive}>
                      Inactivo
                      <XCircle size={16} color="red" />
                    </span>
                  )}
                </span>
              </div>
              {/* {packageItem.discount_package > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <Percent size={16} />
                    <span>Descuento del Paquete:</span>
                  </span>
                  <span className={styles.infoValue}>
                    <span className={styles.discountBadge}>
                      {packageItem.discount_package}%
                    </span>
                  </span>
                </div>
              )} */}
            </div>
            
            {/* Price summary section */}
            <div className={styles.priceSummarySection}>
              <h4 className={styles.priceSummaryTitle}>
                <span>Resumen de Precios</span>
              </h4>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Precio total productos:</span>
                  <span className={styles.priceValue}>€{totalPrice.toFixed(2)}</span>
                </div>
                {packageItem.discount_package > 0 && (
                  <>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Descuento ({packageItem.discount_package}%):</span>
                      <span className={styles.discountValue}>-€{(totalPrice - discountedPrice).toFixed(2)}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}><strong>Precio final del paquete:</strong></span>
                      <span className={styles.finalPriceValue}><strong>€{discountedPrice.toFixed(2)}</strong></span>
                    </div>
                  </>
                )}
                {packageItem.discount_package === 0 && (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}><strong>Precio final del paquete:</strong></span>
                    <span className={styles.finalPriceValue}><strong>€{totalPrice.toFixed(2)}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.packageCardSection}>
            <h3 className={styles.sectionTitle}>
              <Layers size={20} />
              <span>Productos en el Paquete ({validProductDetails.length})</span>
            </h3>
            
            {validProductDetails.length > 0 ? (
              <div className={styles.productsList}>
                {validProductDetails.map((product, index) => (
                  <div key={product.id_product} className={styles.packageProductItem}>
                    <div className={styles.packageProductImageWrapper}>
                      <ProductImage id_product={product.id_product} />
                    </div>
                    <div className={styles.packageProductInfo}>
                      <h4>{product.name_product}</h4>
                      <p>
                        <span className={styles.productLabel}>Tipo:</span> 
                        {product.type_product}{product.subtype_product ? ` - ${product.subtype_product}` : ''}
                      </p>
                      <p>
                        <span className={styles.productLabel}>Precio:</span> 
                        €{product.price_product}
                        {product.discount_product > 0 && (
                          <span className={styles.discountBadge}>
                            -{product.discount_product}%
                          </span>
                        )}
                      </p>
                      {product.info_product && (
                        <p className={styles.productDescription}>
                          {product.info_product.length > 100 
                            ? `${product.info_product.substring(0, 100)}...` 
                            : product.info_product}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noProducts}>No hay productos en este paquete</p>
            )}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default PackageCard;