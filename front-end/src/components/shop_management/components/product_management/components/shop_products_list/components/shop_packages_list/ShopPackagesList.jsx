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
  Tag,
  ArrowLeft,
  Monitor
} from 'lucide-react';
import { formatImageUrl } from '../../../../../../../../utils/image/packageImageUploadService.js';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';
import ConfirmationModal from '../../../../../../../confirmation_modal/ConfirmationModal.jsx';
import OffersBoard from './components/offers_board/OffersBoard.jsx';

import styles from '../../../../../../../../../../public/css/ShopPackagesList.module.css';

const ShopPackagesList = ({ onBack }) => {
  const { 
    packages, 
    setPackages,
    setSelectedPackage,
    setIsAddingPackage,
    setShowPackageCreationForm,
    packageListKey
  } = usePackage();
  const { selectedShop } = useShop();
  const { 
    setError, 
    setShowErrorCard,
    setSuccess,
    setShowSuccessCard,
    openImageModal,
    showOffersBoard,
    setShowOffersBoard
  } = useUI();
  
  // Local state
  const [expandedPackages, setExpandedPackages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  
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
          setError(prevError => ({
            ...prevError,
            productError: response.data.error
          }));
          setShowErrorCard(true);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
      setError(prevError => ({
        ...prevError,
        productError: 'Error al cargar los paquetes'
      }));
      setShowErrorCard(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowOffersBoard = () => {
    // Only show if there are active packages
    const activePackages = packages.filter(pkg => 
      pkg.active_package && pkg.name_package && pkg.name_package.trim() !== ''
    );
    
    if (activePackages.length === 0) {
      setError(prevError => ({
        ...prevError,
        productError: 'No hay ofertas activas para mostrar'
      }));
      setShowErrorCard(true);
      return;
    }
    
    setShowOffersBoard(true);
  };
  
  // Load packages when shop changes or packageListKey updates
  useEffect(() => {
    fetchPackages();
  }, [selectedShop, packageListKey]);
  
  useEffect(() => {
    console.log('PACKAGES STATE UPDATED:', packages);
    console.log('Number of packages:', packages.length);
    if (packages.length > 0) {
      console.log('First package active status:', packages[0].active_package, 'Type:', typeof packages[0].active_package);
    }
  }, [packages]);
  
  // Animation for package list
  const packagesTransition = useTransition(packages, {
    ...shopsListAnimations.shopCardAnimation,
    keys: item => `${item.id_package}-${item.active_package}` // Include active status in key to force re-render
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
  
  const handleEditPackage = (pkg) => {
    console.log('Editing package:', pkg);
    setSelectedPackage(pkg);
    setIsAddingPackage(true);
    setShowPackageCreationForm(true); // This is important to show the form
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
      console.log('Attempting to delete package with ID:', packageToDelete.id_package);
      
      //update: Use the correct endpoint path
      const response = await axiosInstance.delete(`/api/package/remove/${packageToDelete.id_package}`);
      
      console.log('Delete response:', response.data);
      
      if (response.data && (response.data.success || response.data.data)) {
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success || 'Paquete eliminado exitosamente'
        }));
        setShowSuccessCard(true);
        
        //update: Remove the package from the local state immediately
        setPackages(prevPackages => 
          prevPackages.filter(pkg => pkg.id_package !== packageToDelete.id_package)
        );
        
        // Also refresh the package list to ensure sync with backend
        setTimeout(() => {
          fetchPackages();
        }, 500);
        
        // Close modal
        setShowDeleteModal(false);
        setPackageToDelete(null);
      } else {
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || 'Error al eliminar el paquete'
        }));
        setShowErrorCard(true);
        
        // Refresh packages on error to stay in sync
        await fetchPackages();
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      console.error('Error response:', error.response);
      
      // Check if it's a 404 or successful deletion despite error
      if (error.response && error.response.status === 404) {
        // Package might already be deleted, refresh the list
        console.log('Package not found, refreshing list...');
        await fetchPackages();
        setShowDeleteModal(false);
        setPackageToDelete(null);
      } else {
        setError(prevError => ({
          ...prevError,
          productError: error.response?.data?.error || 'Error al eliminar el paquete'
        }));
        setShowErrorCard(true);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleStatus = async (pkg) => {
    try {
      setIsTogglingStatus(pkg.id_package);
      
      console.log('BEFORE TOGGLE - Package:', pkg.id_package, 'Current status:', pkg.active_package);
      console.log('BEFORE TOGGLE - All packages:', packages);
      
      // Call the API endpoint
      const response = await axiosInstance.patch(`/package/toggle-status/${pkg.id_package}`);
      
      console.log('API RESPONSE:', response.data);
      
      if (response.data && response.data.success) {
        // Use the correct setSuccess function
        setSuccess(prev => ({
          ...prev,
          productSuccess: response.data.success
        }));
        setShowSuccessCard(true);
        
        // Get the new status from the response
        const newStatus = response.data.data?.active_package;
        console.log('NEW STATUS FROM API:', newStatus);
        
        // Update the packages array
        const updatedPackages = packages.map(p => {
          if (p.id_package === pkg.id_package) {
            const updatedPackage = {
              ...p,
              active_package: newStatus !== undefined ? newStatus : !p.active_package
            };
            console.log('UPDATED PACKAGE:', updatedPackage);
            return updatedPackage;
          }
          return p;
        });
        
        console.log('AFTER TOGGLE - Updated packages:', updatedPackages);
        
        // Set the new packages array
        setPackages(updatedPackages);
        
        // Force a re-render by updating the key
        setUpdateKey(prev => prev + 1);
        
        // Double-check by fetching fresh data after a short delay
        setTimeout(async () => {
          console.log('Fetching fresh data from server...');
          await fetchPackages();
        }, 500);
        
      } else {
        console.error('API ERROR:', response.data.error);
        setError(prevError => ({
          ...prevError,
          productError: response.data.error || 'Error al cambiar el estado del paquete'
        }));
        setShowErrorCard(true);
        // Refresh to sync with backend on error
        await fetchPackages();
      }
    } catch (error) {
      console.error('EXCEPTION in toggle:', error);
      setError(prevError => ({
        ...prevError,
        productError: error.response?.data?.error || 'Error al cambiar el estado del paquete'
      }));
      setShowErrorCard(true);
      // Refresh packages to ensure UI is in sync with backend even on error
      await fetchPackages();
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
  
  const handleBackToProductsList = () => {
    console.log('Navigating back to ShopProductsList from ShopPackagesList');
    if (onBack && typeof onBack === 'function') {
      onBack();
    }
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
        <button 
          onClick={handleBackToProductsList}
          className={styles.backButton}
          style={{ marginTop: '1rem' }}
        >
          <ArrowLeft size={20} />
          <span>a Productos</span>
        </button>
      </div>
    );
  }
  
  return (
    <>
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem', 
          paddingLeft: '1rem',
          paddingRight: '1rem' 
        }}>
          <button 
            onClick={handleBackToProductsList}
            className={styles.backButton}
            title="Volver a la lista de productos"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid lightgray',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--light-gray)';
              e.currentTarget.style.borderColor = 'var(--app-purple)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'lightgray';
            }}
          >
            <ArrowLeft size={20} />
            <span>a Productos</span>
          </button>
        </div>
        
        <div className={styles.header}>
          <h3 className={styles.title}>
            Paquetes ({packages.length})
          </h3>
          {packages.length > 0 && (
            <button 
              onClick={handleShowOffersBoard}
              className={styles.offersButton}
              title="Mostrar tablero de ofertas"
            >
              <Monitor size={20} />
              <span>Mostrar Ofertas</span>
            </button>
          )}
        </div>
        
        {packages.length === 0 ? (
          <div className={styles.emptyContainer}>
            <Package size={48} color='lightgray'/>
            <p>No hay paquetes creados</p>
          </div>
        ) : (
          <div className={styles.packagesList} key={updateKey}>
            {packages.map(pkg => (
              <div key={`package-${pkg.id_package}-${pkg.active_package}`} className={styles.packageCard}>
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
                        {console.log(`Rendering package ${pkg.id_package}, active_package:`, pkg.active_package, 'Type:', typeof pkg.active_package)}
                        <span 
                          key={`status-${pkg.id_package}-${pkg.active_package}-${updateKey}`}
                          className={`${styles.statusBadge} ${pkg.active_package === true || pkg.active_package === 1 ? styles.active : styles.inactive}`}
                        >
                          {pkg.active_package === true || pkg.active_package === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                        {pkg.discount_package > 0 && (
                          <span className={styles.discountBadge}>
                            <Tag size={12} />
                            {pkg.discount_package}% dto
                          </span>
                        )}
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
                      key={`toggle-${pkg.id_package}-${pkg.active_package}`}
                      onClick={() => handleToggleStatus(pkg)}
                      className={styles.actionButton}
                      disabled={isTogglingStatus === pkg.id_package}
                      title={pkg.active_package === true || pkg.active_package === 1 ? 'Desactivar' : 'Activar'}
                    >
                      {pkg.active_package === true || pkg.active_package === 1 ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className={styles.actionButton}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked for package ID:', pkg.id_package);
                        handleDeletePackage(pkg);
                      }}
                      className={styles.actionButton}
                      title="Eliminar"
                      type="button"
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
                      <span className={styles.productCount}>
                          Productos ({[pkg.product1, pkg.product2, pkg.product3, pkg.product4, pkg.product5].filter(p => p).length})
                      </span>
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
              </div>
            ))}
          </div>
        )}
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
      
      {showOffersBoard && (
        <OffersBoard 
          packages={packages}
          shopName={selectedShop?.name_shop || ''}
          onClose={() => setShowOffersBoard(false)}
        />
      )}
    </>
  );
};

export default ShopPackagesList;