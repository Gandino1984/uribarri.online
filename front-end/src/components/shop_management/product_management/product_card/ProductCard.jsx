import React, { useContext, useEffect } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { X, Star, ShoppingCart, Tag, Calendar, Package, MapPin, Globe } from 'lucide-react';
import styles from '../../../../../../public/css/ProductCard.module.css';

const ProductCard = ({ onClose }) => {
  const { 
    selectedProductDetails,
    setSelectedProductDetails
  } = useContext(AppContext);

  // Get the imageUrl function from the context or recreate it
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    
    // Using the baseURL from your axios instance configuration
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';
    const cleanPath = imagePath.replace(/^\/+/, '');
    const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");
    
    return imageUrl;
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      // Reset selected product when component unmounts
      setSelectedProductDetails(null);
    };
  }, [setSelectedProductDetails]);

  if (!selectedProductDetails) {
    return null;
  }

  const {
    name_product,
    price_product,
    sold_product,
    discount_product,
    season_product,
    type_product,
    subtype_product,
    info_product,
    calification_product,
    image_product,
    country_product,
    locality_product
  } = selectedProductDetails;

  // Calculate discounted price if there's a discount
  const discountedPrice = discount_product > 0 
    ? (price_product - (price_product * discount_product / 100)).toFixed(2) 
    : null;

  // Create stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullRating = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullRating) {
        stars.push(<Star key={i} className={styles.starFilled} size={18} fill="gold" stroke="gold" />);
      } else if (i === fullRating && hasHalfStar) {
        stars.push(<Star key={i} className={styles.starHalf} size={18} fill="gold" stroke="gold" />);
      } else {
        stars.push(<Star key={i} className={styles.starEmpty} size={18} stroke="gray" />);
      }
    }
    
    return stars;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.productCard}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className={styles.cardContent}>
          <div className={styles.imageContainer}>
            {image_product ? (
              <img 
                src={getImageUrl(image_product)} 
                alt={name_product} 
                className={styles.productImage} 
              />
            ) : (
              <div className={styles.noImage}>
                <Package size={60} />
                <p>Sin imagen</p>
              </div>
            )}
          </div>
          
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{name_product}</h2>
            
            <div className={styles.ratingContainer}>
              {renderStars(calification_product)}
              <span className={styles.ratingText}>
                {calification_product.toFixed(1)}
              </span>
            </div>
            
            <div className={styles.priceContainer}>
              {discount_product > 0 ? (
                <>
                  <span className={styles.originalPrice}>€{Number(price_product).toFixed(2)}</span>
                  <span className={styles.discountedPrice}>€{discountedPrice}</span>
                  <span className={styles.discountBadge}>-{discount_product}%</span>
                </>
              ) : (
                <span className={styles.price}>€{Number(price_product).toFixed(2)}</span>
              )}
            </div>
            
            <div className={styles.soldInfo}>
              <ShoppingCart size={18} />
              <span>Vendidos: {sold_product}</span>
            </div>  
            
            <div className={styles.categoryInfo}>
              <div className={styles.infoItem}>
                <Tag size={18} />
                <span>Tipo: {type_product}</span>
              </div>
              
              {subtype_product && (
                <div className={styles.infoItem}>
                  <Tag size={18} />
                  <span>Subtipo: {subtype_product}</span>
                </div>
              )}
              
              <div className={styles.infoItem}>
                <Calendar size={18} />
                <span>Temporada: {season_product}</span>
              </div>

              {/* Nuevos campos de origen */}
              {country_product && (
                <div className={styles.infoItem}>
                  <Globe size={18} />
                  <span>País de origen: {country_product}</span>
                </div>
              )}
              
              {locality_product && (
                <div className={styles.infoItem}>
                  <MapPin size={18} />
                  <span>Localidad: {locality_product}</span>
                </div>
              )}
            </div>
            
            {info_product && (
              <div className={styles.description}>
                <h3>Información adicional:</h3>
                <p>{info_product}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;