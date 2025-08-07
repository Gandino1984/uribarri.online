import React, { useState, useEffect } from 'react';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import { useTransition, animated } from '@react-spring/web';
import { shopsListAnimations } from '../../../../../../../../utils/animation/transitions.js';
import { 
  Package, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Image,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag
} from 'lucide-react';
import { formatImageUrl } from '../../../../../../../../utils/image/packageImageUploadService.js';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';
import ConfirmationModal from '../../../../../../../confirmation_modal/ConfirmationModal.jsx';

import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';

const ShopPackagesList = () => {
  const { 
    packages, 
    setPackages,
    setSelectedPackage,
    setIsAddingPackage,
    packageListKey
  } = usePackage();
  const { selectedShop } = useShop();
  const { 
    setError, 
    setShowErrorCard,
    setSuccess,
    setShowSuccessCard,
    setSingleSuccess,
    setSingleError,
    openImageModal
  } = useUI();
  
  // Local state
  const [expandedPackages, setExpandedPackages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch packages function
  const fetchPackages = async () => {
    if (!selectedShop?.id_shop) {
      console.log('No shop selected, skipping package fetch');
      setPackages([]);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Fetching packages for shop ID: ${selectedShop.id_shop}`);
      
      const response = await axiosInstance.get(`/package/by-shop-id/${selectedShop.id_shop}`);
      
      if (response.data && !response.data.error) {
        const fetchedPackages = response.data.data || [];
        console.log(`Fetched ${fetchedPackages.length} packages for shop ${selectedShop.name_shop}`);
        setPackages(fetchedPackages);
      } else {
        console.error('Error in response:', response.data?.error);
        setPackages([]);
        if (response.data?.error) {
          setSingleError('productError', response.data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
      setSingleError('productError', 'Error al cargar los paquetes');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load packages when shop changes or packageListKey updates
  useEffect(() => {
    fetchPackages();
  }, [selectedShop, packageListKey]);
  
  // Animation for package list
  const packagesTransition = useTransition(packages, {
    ...shopsListAnimations.shopCardAnimation,
    keys: item => item.id_package
  });
  
  // Toggle expanded state for a package
  const toggleExpanded = (packageId) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };
  
  // Handle edit package
  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setIsAddingPackage(true);
  };
  
  // Handle delete package
  const handleDeletePackage = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };
  
  // Confirm delete package
  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Use the correct endpoint with the package ID in the URL
      const response = await axiosInstance.delete(`/package/remove/${packageToDelete.id_package}`);
      
      if (response.data && response.data.success) {
        setSingleSuccess('productSuccess', response.data.success);
        
        // Refresh the package list
        await fetchPackages();
        
        // Close modal
        setShowDeleteModal(false);
        setPackageToDelete(null);
      } else {
        setSingleError('productError', response.data.error || 'Error al eliminar el paquete');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      setSingleError('productError', error.response?.data?.error || 'Error al eliminar el paquete');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Toggle package active status
  const handleToggleStatus = async (pkg) => {
    try {
      setIsTogglingStatus(pkg.id_package);
      
      const response = await axiosInstance.patch(`/package/toggle-status/${pkg.id_package}`);
      
      if (response.data && response.data.success) {
        setSingleSuccess('productSuccess', response.data.success);
        
        // Update local state
        setPackages(prev => 
          prev.map(p => 
            p.id_package === pkg.id_package 
              ? { ...p, active_package: !p.active_package }
              : p
          )
        );
      } else {
        setSingleError('productError', response.data.error || 'Error al cambiar el estado del paquete');
      }
    } catch (error) {
      console.error('Error toggling package status:', error);
      setSingleError('productError', error.response?.data?.error || 'Error al cambiar el estado del paquete');
    } finally {
      setIsTogglingStatus(null);
    }
  };
  
  // Format price with discount
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };
  
  // Calculate package prices
  const calculatePackagePrices = (pkg) => {
    const products = [pkg.product1, pkg.product2, pkg.product3, pkg.product4, pkg.product5].filter(p => p);
    const totalPrice = products.reduce((sum, product) => sum + (parseFloat(product.price_product) || 0), 0);
    const discount = pkg.discount_package || 0;
    const discountedPrice = totalPrice * (1 - discount / 100);
    
    return {
      totalPrice,
      discountedPrice,
      savings: totalPrice - discountedPrice
    };
  };
  
  // Render product item in package
  const renderProductItem = (product, index) => {
    if (!product) return null;
    
    return (
      <div key={product.id_product || index} className={styles.productItem}>
        <span className={styles.productIndex}>{index}.</span>
        <span className={styles.productName}>{product.name_product}</span>
        <span className={styles.productPrice}>€{formatPrice(parseFloat(product.price_product))}</span>
      </div>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Package size={48} className={styles.loadingIcon} />
        <p>Cargando paquetes...</p>
      </div>
    );
  }
  
  if (!selectedShop) {
    return (
      <div className={styles.noShopContainer}>
        <AlertCircle size={48} />
        <p>Selecciona un comercio para ver sus paquetes</p>
      </div>
    );
  }
  
  if (packages.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Package size={48} />
        <p>No hay paquetes creados</p>
        <button 
          className={styles.createButton}
          onClick={() => setIsAddingPackage(true)}
        >
          Crear primer paquete
        </button>
      </div>
    );
  }
  
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <Package size={20} />
            Paquetes ({packages.length})
          </h3>
        </div>
        
        <div className={styles.packagesList}>
          {packagesTransition((style, pkg) => (
            <animated.div style={style} className={styles.packageCard}>
              <div className={styles.packageHeader}>
                <div className={styles.packageMainInfo}>
                  {/* Display package image if available */}
                  {pkg.image_package ? (
                    <div 
                      className={styles.packageImageContainer}
                      onClick={() => openImageModal(formatImageUrl(pkg.image_package))}
                    >
                      <img 
                        src={formatImageUrl(pkg.image_package)} 
                        alt={pkg.name_package || 'Paquete'}
                        className={styles.packageImage}
                        onError={(e) => {
                          console.error('Error loading package image:', pkg.image_package);
                          // Hide broken image
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                      <div className={styles.imageOverlay}>
                        <Image size={16} />
                      </div>
                    </div>
                  ) : (
                    <div className={`${styles.packageImageContainer} ${styles.noImage}`}>
                      <Package size={30} className={styles.placeholderIcon} />
                    </div>
                  )}
                  
                  <div className={styles.packageInfo}>
                    <h4 className={styles.packageName}>{pkg.name_package || 'Paquete sin nombre'}</h4>
                    <div className={styles.packageMeta}>
                      <span className={`${styles.statusBadge} ${pkg.active_package ? styles.active : styles.inactive}`}>
                        {pkg.active_package ? 'Activo' : 'Inactivo'}
                      </span>
                      {pkg.discount_package > 0 && (
                        <span className={styles.discountBadge}>
                          <Tag size={12} />
                          {pkg.discount_package}% dto
                        </span>
                      )}
                      <span className={styles.productCount}>
                        {[pkg.product1, pkg.product2, pkg.product3, pkg.product4, pkg.product5].filter(p => p).length} productos
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.packagePricing}>
                  {(() => {
                    const prices = calculatePackagePrices(pkg);
                    return (
                      <>
                        {pkg.discount_package > 0 && (
                          <span className={styles.originalPrice}>€{formatPrice(prices.totalPrice)}</span>
                        )}
                        <span className={styles.finalPrice}>€{formatPrice(prices.discountedPrice)}</span>
                        {pkg.discount_package > 0 && (
                          <span className={styles.savings}>Ahorro: €{formatPrice(prices.savings)}</span>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                <div className={styles.packageActions}>
                  <button
                    onClick={() => handleToggleStatus(pkg)}
                    className={styles.actionButton}
                    disabled={isTogglingStatus === pkg.id_package}
                    title={pkg.active_package ? 'Desactivar' : 'Activar'}
                  >
                    {pkg.active_package ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className={styles.actionButton}
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleDeletePackage(pkg)}
                    className={styles.actionButton}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => toggleExpanded(pkg.id_package)}
                    className={styles.expandButton}
                    title={expandedPackages.has(pkg.id_package) ? 'Contraer' : 'Expandir'}
                  >
                    {expandedPackages.has(pkg.id_package) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>
              
              {expandedPackages.has(pkg.id_package) && (
                <div className={styles.packageDetails}>
                  <div className={styles.productsSection}>
                    <h5 className={styles.sectionTitle}>Productos incluidos:</h5>
                    <div className={styles.productsList}>
                      {pkg.product1 && renderProductItem(pkg.product1, 1)}
                      {pkg.product2 && renderProductItem(pkg.product2, 2)}
                      {pkg.product3 && renderProductItem(pkg.product3, 3)}
                      {pkg.product4 && renderProductItem(pkg.product4, 4)}
                      {pkg.product5 && renderProductItem(pkg.product5, 5)}
                    </div>
                  </div>
                  
                  <div className={styles.packageFooter}>
                    <span className={styles.packageId}>ID: {pkg.id_package}</span>
                    <span className={styles.creationDate}>
                      Creado: {new Date(pkg.creation_package).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              )}
            </animated.div>
          ))}
        </div>
      </div>
      
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPackageToDelete(null);
          }}
          onConfirm={confirmDeletePackage}
          title="Eliminar Paquete"
          message={`¿Estás seguro de que deseas eliminar el paquete "${packageToDelete?.name_package || 'Sin nombre'}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default ShopPackagesList;