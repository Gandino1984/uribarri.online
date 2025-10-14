import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Package, Tag, Clock, Pause, Play } from 'lucide-react';
//update: Fixed import path - use the main imageUploadService
import { formatImageUrl } from '../../../../../../../../../../utils/image/imageUploadService.js';
import styles from '../../../../../../../../../../../public/css/OffersBoard.module.css';

const OffersBoard = ({ packages = [], shopName = '', onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Filter only active packages with names
  const activePackages = packages.filter(pkg => 
    pkg.active_package && pkg.name_package && pkg.name_package.trim() !== ''
  );

  // Calculate prices for a package
  const calculatePackagePrices = (pkg) => {
    const products = [pkg.product1, pkg.product2, pkg.product3, pkg.product4, pkg.product5].filter(p => p);
    const totalPrice = products.reduce((sum, product) => sum + (parseFloat(product.price_product) || 0), 0);
    const discount = pkg.discount_package || 0;
    const discountedPrice = totalPrice * (1 - discount / 100);
    
    return {
      totalPrice,
      discountedPrice,
      savings: totalPrice - discountedPrice,
      productCount: products.length
    };
  };

  // Auto-advance timer
  useEffect(() => {
    if (!isPaused && activePackages.length > 1) {
      // Timer countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNext();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [currentIndex, isPaused, activePackages.length]);

  // Navigation handlers
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePackages.length);
    setTimeLeft(30);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePackages.length) % activePackages.length);
    setTimeLeft(30);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setTimeLeft(30);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (activePackages.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Package size={80} color="#999" />
        <h2 className={styles.emptyTitle}>No hay ofertas disponibles</h2>
        <p className={styles.emptyText}>No se encontraron paquetes activos para mostrar</p>
        <button onClick={onClose} className={styles.closeEmptyButton}>
          Cerrar
        </button>
      </div>
    );
  }

  const currentPackage = activePackages[currentIndex];
  const prices = calculatePackagePrices(currentPackage);
  const products = [
    currentPackage.product1,
    currentPackage.product2,
    currentPackage.product3,
    currentPackage.product4,
    currentPackage.product5
  ].filter(p => p);

  const packageImage = currentPackage.image_package ? formatImageUrl(currentPackage.image_package) : null;

  return (
    <div className={styles.container}>
      {/* Dark background */}
      <div className={styles.backgroundDark} />

      {/* Header with controls */}
      <div className={styles.header}>
        <div className={styles.shopInfo}>
          <h3 className={styles.shopName}>{shopName || 'Ofertas Especiales'}</h3>
          {activePackages.length > 1 && (
            <div className={styles.timerContainer}>
              <Clock size={16} />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
        
        <div className={styles.controls}>
          {activePackages.length > 1 && (
            <button onClick={togglePause} className={styles.controlButton}>
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          )}
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        <div 
          className={`${styles.offerCard} ${packageImage ? styles.offerCardWithImage : styles.offerCardGradient}`}
          style={packageImage ? { backgroundImage: `url("${packageImage}")` } : undefined}
        >
          {packageImage && <div className={styles.imageOverlay} />}

          <div className={`${styles.offerContent} ${packageImage ? styles.offerContentWithImage : ''}`}>
            {/* Discount badge */}
            {currentPackage.discount_package > 0 && (
              <div className={styles.discountBadge}>
                <Tag size={20} />
                <span>{currentPackage.discount_package}% descuento</span>
              </div>
            )}

            {/* Package name */}
            <h1 className={styles.packageName}>{currentPackage.name_package}</h1>

            {/* Products list */}
            <div className={styles.productsList}>
              {products.map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <span className={styles.productBullet}>•</span>
                  <span className={styles.productName}>{product.name_product}</span>
                </div>
              ))}
            </div>

            {/* Price display */}
            <div className={styles.priceSection}>
              {currentPackage.discount_package > 0 && (
                <>
                  <div className={styles.originalPrice}>
                    <span className={styles.priceLabel}>Precio normal:</span>
                    <span className={styles.strikethrough}>€{prices.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.savings}>
                    <span>Ahorro: €{prices.savings.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className={styles.finalPrice}>
                <span className={styles.priceLabel}>Precio especial:</span>
                <span className={styles.priceValue}>€{prices.discountedPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows (only if multiple packages) */}
      {activePackages.length > 1 && (
        <>
          <button onClick={handlePrev} className={styles.navButtonLeft}>
            <ChevronLeft size={40} />
          </button>
          <button onClick={handleNext} className={styles.navButtonRight}>
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* Progress bar */}
      {activePackages.length > 1 && !isPaused && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{
              width: `${((30 - timeLeft) / 30) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OffersBoard;