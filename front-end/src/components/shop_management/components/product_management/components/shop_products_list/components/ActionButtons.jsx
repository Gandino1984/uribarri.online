import React, { useState, useEffect } from 'react';
import { 
  SquarePlus, 
  Pencil, 
  Trash2, 
  Filter, 
  ChevronDown,
  Package,
  PackageOpen,
  Menu,
  X
} from 'lucide-react';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ActionButtons = ({ 
  handleAddProduct, 
  handleBulkUpdate, 
  handleBulkDelete, 
  toggleFilters, 
  handleCreatePackage,
  showFilters, 
  selectedProducts, 
  activeFiltersCount,
  navigateToPackages
}) => {
  
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [iconSize, setIconSize] = useState(17);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [filterButtonAnimation, setFilterButtonAnimation] = useState({
    transform: 'rotate(0deg)',
    transition: 'transform 0.3s ease'
  });
  
  useEffect(() => {
    setFilterButtonAnimation({
      transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease'
    });
  }, [showFilters]);
  
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 768;
      setIsSmallScreen(smallScreen);
      setIconSize(smallScreen ? 16 : 17);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  //update: Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest(`.${styles.searchAndMenuContainer}`)) {
        setShowMobileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);
  
  //update: Handle action button clicks on mobile
  const handleMobileAction = (action) => {
    action();
    setShowMobileMenu(false);
  };
  
  //update: Render mobile menu
  if (isSmallScreen) {
    return (
      <>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`${styles.mobileMenuButton} ${showMobileMenu ? styles.active : ''}`}
          title="Menú de acciones"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className={`${styles.mobileMenuDropdown} ${showMobileMenu ? styles.open : ''}`}>
          <div className={styles.mobileMenuContent}>
            <button
              onClick={() => handleMobileAction(handleAddProduct)}
              className={`${styles.active} ${styles.createButton}`}
              title="Añadir producto"
            >
              <SquarePlus size={iconSize} />
              <span className={styles.buttonText}>Crear Producto</span>
            </button>

            <button
              onClick={() => handleMobileAction(handleBulkUpdate)}
              className={styles.active}
              disabled={selectedProducts.size === 0}
              title="Actualizar producto"
            >
              <Pencil size={iconSize} />
              <span className={styles.buttonText}>Actualizar</span>
            </button>
            
            <button
              onClick={() => handleMobileAction(handleBulkDelete)}
              className={styles.active}
              disabled={selectedProducts.size === 0}
              title="Borrar producto"
            >
              <Trash2 size={iconSize} />
              <span className={styles.buttonText}>Borrar</span>
            </button>
            
            <button
              onClick={() => handleMobileAction(toggleFilters)}
              className={`${styles.active} ${showFilters ? styles.active : ''}`}
              title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <Filter size={iconSize} />
              <span className={styles.buttonText}>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className={styles.filterBadge}>{activeFiltersCount}</span>
              )}
              <div style={filterButtonAnimation} className={styles.filterButtonIcon}>
                <ChevronDown size={12} />
              </div>
            </button>
            
            <button
              onClick={() => handleMobileAction(handleCreatePackage)}
              className={styles.active}
              disabled={selectedProducts.size === 0}
              title="Crear paquete con productos seleccionados"
            >
              <Package size={iconSize} />
              <span className={styles.buttonText}>Crear paquete</span>
            </button>
            
            <button
              onClick={() => handleMobileAction(navigateToPackages)}
              className={styles.active}
              title="Ver lista de paquetes"
            >
              <PackageOpen size={iconSize} />
              <span className={styles.buttonText}>Ver paquetes</span>
            </button>
          </div>
        </div>
      </>
    );
  }
  
  //update: Desktop layout remains the same
  return (
    <div className={styles.buttonGroup}>
      <div className={styles.buttonGroupRow1}>
        <button
          onClick={handleAddProduct}
          className={`${styles.active} ${styles.createButton}`}
          title="Añadir producto"
        >
          <SquarePlus size={iconSize} />
          <span className={styles.buttonText}>Crear</span>
        </button>

        <button
          onClick={handleBulkUpdate}
          className={styles.active}
          disabled={selectedProducts.size === 0}
          title="Actualizar producto"
        >
          <Pencil size={iconSize} />
          <span className={styles.buttonText}>Actualizar</span>
        </button>
        
        <button
          onClick={handleBulkDelete}
          className={styles.active}
          disabled={selectedProducts.size === 0}
          title="Borrar producto"
        >
          <Trash2 size={iconSize} />
          <span className={styles.buttonText}>Borrar</span>
        </button>
        
        <button
          onClick={toggleFilters}
          className={`${styles.active} ${showFilters ? styles.active : ''}`}
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={iconSize} />
          <span className={styles.buttonText}>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
          <div style={filterButtonAnimation} className={styles.filterButtonIcon}>
            <ChevronDown size={14} />
          </div>
        </button>
      </div>

      <div className={styles.buttonGroupRow2}>
        <button
          onClick={handleCreatePackage}
          className={styles.active}
          disabled={selectedProducts.size === 0}
          title="Crear paquete con productos seleccionados"
        >
          <Package size={iconSize} />
          <span className={styles.buttonText}>Crear paquete</span>
        </button>
        
        <button
          onClick={navigateToPackages}
          className={styles.active}
          title="Ver lista de paquetes"
        >
          <PackageOpen size={iconSize} />
          <span className={styles.buttonText}>Ver paquetes</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;