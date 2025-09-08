import React, { useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import ShopCard from '../shop_management/components/shop_card/ShopCard.jsx';
import FiltersForShops from './components/FiltersForShops.jsx';
import RecommendedFilters from './components/recommendedFilters/RecommendedFilters.jsx';
import useShopWindow from './ShopWindowUtils.jsx';
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
  const { shops, setShops, shopTypesAndSubtypes, setSelectedShop } = useShop();
  
  const uiHandlers = {
    setShowShopWindow,
    setShowShopManagement,
    setShowShopStore,
    setSelectedShopForStore,
    setShowLandingPage
  };
  
  const shopHandlers = {
    shopTypesAndSubtypes
  };
  
  const {
    loading,
    error,
    showFilters,
    searchTerm,
    filters,
    fetchAllShops,
    handleShopClick,
    toggleFilters,
    handleFilterChange,
    handleSearchChange,
    handleDeliveryChange,
    handleOpenNowChange,
    handleTopRatedChange,
    handleDayChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount,
    getDisplayedShops,
    setShowFilters
  } = useShopWindow(currentUser, shops, setShops, uiHandlers, shopHandlers);
  
  const activeFiltersCount = getActiveFiltersCount();
  const displayedShops = getDisplayedShops();
  
  useEffect(() => {
    fetchAllShops();
  }, [fetchAllShops]);

  const transitions = useTransition(displayedShops, {
    from: { 
      opacity: 0, 
      transform: 'translate3d(0,20px,0)' 
    },
    enter: { 
      opacity: 1, 
      transform: 'translate3d(0,0px,0)' 
    },
    leave: { 
      opacity: 0, 
      transform: 'translate3d(0,-20px,0)' 
    },
    trail: 100,
    config: { tension: 200, friction: 25 }
  });

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const handleRecommendedFilterSelect = (filterType) => {
    if (filterType) {
      handleFilterChange('tipo_comercio', filterType);
      handleFilterChange('subtipo_comercio', null);
    } else {
      handleFilterChange('tipo_comercio', null);
      handleFilterChange('subtipo_comercio', null);
    }
  };

  //update: Add handler for shop card order button
  const handleShopOrder = (shop) => {
    console.log('ShopWindow - handleShopOrder called for shop:', shop);
    setSelectedShop(shop);
    setSelectedShopForStore(shop);
    setShowShopWindow(false);
    setShowShopStore(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Comercio de barrio</h1>
      </div>

      <RecommendedFilters 
        onFilterSelect={handleRecommendedFilterSelect}
        currentFilter={filters.tipo_comercio}
      />
      
      <div className={styles.filterButtonSection}>
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
          handleResetFilters={handleResetFilters}
          getAvailableSubtypes={getAvailableSubtypes}
          onClose={handleCloseFilters}
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
            <button onClick={handleResetFilters} className={styles.resetButton}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {!loading && !error && displayedShops.length > 0 && (
        <>
          <div className={styles.shopsCount}>
            <p>Mostrando {displayedShops.length} {displayedShops.length === 1 ? 'comercio' : 'comercios'}</p>
          </div>
          
          <div className={styles.shopsGrid}>
            {transitions((style, shop) => 
              shop ? (
                <animated.div 
                  key={shop.id_shop} 
                  style={style} 
                  className={styles.shopCardWrapper}
                >
                  <ShopCard 
                    shop={shop} 
                    isClickable={false}
                    hideActions={false}
                    onOrder={handleShopOrder}
                  />
                </animated.div>
              ) : null
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopWindow;