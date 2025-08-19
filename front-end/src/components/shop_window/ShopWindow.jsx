import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import ShopCard from '../shop_management/components/shop_card/ShopCard.jsx';
import FiltersForShops from './components/FiltersForShops.jsx';
import useFiltersForShops from './components/FiltersForShopsUtils.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';
import styles from '../../../../public/css/ShopWindow.module.css';
import { Filter, ChevronDown } from 'lucide-react';

const ShopWindow = () => {
  const { currentUser } = useAuth();
  const { 
    setShowShopWindow, 
    setShowShopManagement,
    setShowShopStore,
    setSelectedShopForStore,
    setShowLandingPage
  } = useUI();
  const { shops, setShops, shopTypesAndSubtypes } = useShop();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //update: Add filter visibility state
  const [showFilters, setShowFilters] = useState(false);
  
  //update: Use the filters hook with shops and shopTypesAndSubtypes
  const {
    searchTerm,
    setSearchTerm,
    filters,
    filteredShops,
    handleFilterChange,
    handleSearchChange,
    handleDeliveryChange,
    handleOpenNowChange,
    handleTopRatedChange,
    handleDayChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount
  } = useFiltersForShops(shops, shopTypesAndSubtypes);
  
  //update: Get active filters count
  const activeFiltersCount = getActiveFiltersCount();
  
  // Load all shops when component mounts
  useEffect(() => {
    fetchAllShops();
  }, []);

  const fetchAllShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/shop');
      
      if (response.data && !response.data.error) {
        setShops(response.data.data || []);
      } else {
        setError(response.data.error || 'Error al cargar los comercios');
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Error al cargar los comercios');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    // Hide ShopWindow and show LoginRegisterForm
    setShowShopWindow(false);
    setShowLandingPage(false);
    // This will trigger the LoginRegisterForm to show
  };
  
  const handleShopClick = (shop) => {
    if (!currentUser) {
      // If user is not logged in, redirect to login/register
      setShowShopWindow(false);
      setShowLandingPage(false);
      // Store the selected shop for after login
      setSelectedShopForStore(shop);
    } else if (currentUser.type_user === 'user') {
      // If user is logged in as 'user', show the shop store
      setSelectedShopForStore(shop);
      setShowShopWindow(false);
      setShowShopStore(true);
    }
    // If user is seller or other type, do nothing on click
  };
  
  //update: Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  //update: Handle reset all filters
  const handleResetAllFilters = () => {
    handleResetFilters();
  };
  
  //update: Determine which shops to display - always use filteredShops when filters/search are active
  const hasActiveFilters = getActiveFiltersCount() > 0;
  const displayedShops = hasActiveFilters || searchTerm ? filteredShops : shops;

  const transitions = useTransition(displayedShops, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    trail: 100,
    config: { tension: 200, friction: 25 }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Escaparate Comercial</h1>
        
        {/*update: Add filter toggle button */}
        <button
          onClick={toggleFilters}
          className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={18} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
          <ChevronDown 
            size={16} 
            className={`${styles.filterArrow} ${showFilters ? styles.rotated : ''}`}
          />
        </button>
      </div>
      
      {/*update: Add filters component - pass all hook functions and state */}
      {showFilters && (
        <FiltersForShops 
          searchTerm={searchTerm}
          filters={filters}
          shopTypesAndSubtypes={shopTypesAndSubtypes}
          activeFilterCount={activeFiltersCount}
          handleFilterChange={handleFilterChange}
          handleSearchChange={handleSearchChange}
          handleDeliveryChange={handleDeliveryChange}
          handleOpenNowChange={handleOpenNowChange}
          handleTopRatedChange={handleTopRatedChange}
          handleDayChange={handleDayChange}
          handleResetFilters={handleResetAllFilters}
          getAvailableSubtypes={getAvailableSubtypes}
        />
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Cargando comercios...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchAllShops} className={styles.retryButton}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {!loading && !error && displayedShops.length === 0 && (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>
            {activeFiltersCount > 0 || searchTerm 
              ? "No se encontraron comercios que coincidan con tu búsqueda."
              : "No hay comercios disponibles en este momento"}
          </p>
          {(activeFiltersCount > 0 || searchTerm) && (
            <button onClick={handleResetAllFilters} className={styles.resetButton}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!loading && !error && displayedShops.length > 0 && (
        <>
          {/*update: Add shops count */}
          <div className={styles.shopsCount}>
            <p>Mostrando {displayedShops.length} {displayedShops.length === 1 ? 'comercio' : 'comercios'}</p>
          </div>
          
          <div className={styles.shopsGrid}>
            {transitions((style, shop) => 
              shop && (
                <animated.div 
                  key={shop.id_shop} 
                  style={style} 
                  className={styles.shopCardWrapper}
                >
                  <div 
                    onClick={() => handleShopClick(shop)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleShopClick(shop);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <ShopCard 
                      shop={shop} 
                      isClickable={false} // Disable internal card functionality
                      hideActions={true} // Hide action buttons
                    />
                  </div>
                </animated.div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopWindow;