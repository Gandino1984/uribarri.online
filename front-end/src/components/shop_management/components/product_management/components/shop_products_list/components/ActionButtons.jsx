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
  X,
  ShoppingBag,
  Box
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
  //update: Separate menu states for products and packages
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showPackageMenu, setShowPackageMenu] = useState(false);
  
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
  
  //update: Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.productMenuContainer}`)) {
        setShowProductMenu(false);
      }
      if (!event.target.closest(`.${styles.packageMenuContainer}`)) {
        setShowPackageMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  //update: Handle action button clicks
  const handleAction = (action, menuSetter) => {
    action();
    menuSetter(false);
  };
  
  //update: Render mobile layout with two burger menus
  if (isSmallScreen) {
    return (
      <div className={styles.mobileActionsContainer}>
        {/* Product Actions Menu */}
        <div className={styles.productMenuContainer}>
          <button
            onClick={() => {
              setShowProductMenu(!showProductMenu);
              setShowPackageMenu(false); // Close other menu
            }}
            className={`${styles.burgerMenuButton} ${showProductMenu ? styles.active : ''}`}
            title="Acciones de productos"
          >
            <ShoppingBag size={20} />
            <span className={styles.burgerButtonText}>Productos</span>
          </button>
          
          <div className={`${styles.menuDropdown} ${showProductMenu ? styles.open : ''}`}>
            <div className={styles.menuContent}>
              <button
                onClick={() => handleAction(handleAddProduct, setShowProductMenu)}
                className={`${styles.menuItem} ${styles.createButton}`}
                title="Añadir producto"
              >
                <SquarePlus size={iconSize} />
                <span className={styles.buttonText}>Crear Producto</span>
              </button>

              <button
                onClick={() => handleAction(handleBulkUpdate, setShowProductMenu)}
                className={styles.menuItem}
                disabled={selectedProducts.size === 0}
                title="Actualizar productos seleccionados"
              >
                <Pencil size={iconSize} />
                <span className={styles.buttonText}>Actualizar ({selectedProducts.size})</span>
              </button>
              
              <button
                onClick={() => handleAction(handleBulkDelete, setShowProductMenu)}
                className={styles.menuItem}
                disabled={selectedProducts.size === 0}
                title="Borrar productos seleccionados"
              >
                <Trash2 size={iconSize} />
                <span className={styles.buttonText}>Borrar ({selectedProducts.size})</span>
              </button>
              
              <button
                onClick={() => handleAction(toggleFilters, setShowProductMenu)}
                className={`${styles.menuItem} ${showFilters ? styles.filterActive : ''}`}
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
            </div>
          </div>
        </div>
        
        {/* Package Actions Menu */}
        <div className={styles.packageMenuContainer}>
          <button
            onClick={() => {
              setShowPackageMenu(!showPackageMenu);
              setShowProductMenu(false); // Close other menu
            }}
            className={`${styles.burgerMenuButton} ${showPackageMenu ? styles.active : ''}`}
            title="Acciones de paquetes"
          >
            <Box size={20} />
            <span className={styles.burgerButtonText}>Paquetes</span>
          </button>
          
          <div className={`${styles.menuDropdown} ${showPackageMenu ? styles.open : ''}`}>
            <div className={styles.menuContent}>
              <button
                onClick={() => handleAction(handleCreatePackage, setShowPackageMenu)}
                className={styles.menuItem}
                disabled={selectedProducts.size === 0}
                title="Crear paquete con productos seleccionados"
              >
                <Package size={iconSize} />
                <span className={styles.buttonText}>Crear paquete ({selectedProducts.size})</span>
              </button>
              
              <button
                onClick={() => handleAction(navigateToPackages, setShowPackageMenu)}
                className={styles.menuItem}
                title="Ver lista de paquetes"
              >
                <PackageOpen size={iconSize} />
                <span className={styles.buttonText}>Ver paquetes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  //update: Desktop layout remains the same but with better organization
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
          title="Actualizar productos seleccionados"
        >
          <Pencil size={iconSize} />
          <span className={styles.buttonText}>Actualizar</span>
        </button>
        
        <button
          onClick={handleBulkDelete}
          className={styles.active}
          disabled={selectedProducts.size === 0}
          title="Borrar productos seleccionados"
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