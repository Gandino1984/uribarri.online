import React, { useState, useEffect } from 'react';
import { 
  SquarePlus, 
  Pencil, 
  Trash2, 
  Filter, 
  ChevronDown,
  Package,
  PackageOpen,
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
  
  //update: Unified layout for both mobile and desktop with dropdown menus
  return (
    <div className={styles.actionButtonsWrapper}>
      {/* Product Actions Menu */}
      <div className={`${styles.productMenuContainer} ${showProductMenu ? styles.menuOpen : ''}`}>
        <button
          onClick={() => {
            setShowProductMenu(!showProductMenu);
            setShowPackageMenu(false); // Close other menu
          }}
          className={`${styles.dropdownButton} ${showProductMenu ? styles.active : ''}`}
          title="Acciones de productos"
        >
          <ShoppingBag size={isSmallScreen ? 18 : 20} />
          <span className={styles.dropdownButtonText}>Productos</span>
          <ChevronDown 
            size={isSmallScreen ? 14 : 16} 
            className={`${styles.dropdownArrow} ${showProductMenu ? styles.rotated : ''}`}
          />
        </button>
        
        <div className={`${styles.menuDropdown} ${showProductMenu ? styles.open : ''}`}>
          <div className={styles.menuContent}>
            <button
              onClick={() => handleAction(handleAddProduct, setShowProductMenu)}
              className={`${styles.menuItem} ${styles.createButton}`}
              title="Añadir producto"
            >
              <SquarePlus size={iconSize} />
              <span className={styles.menuItemText}>Crear Producto</span>
            </button>

            <button
              onClick={() => handleAction(handleBulkUpdate, setShowProductMenu)}
              className={`${styles.menuItem} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
              disabled={selectedProducts.size === 0}
              title="Actualizar productos seleccionados"
            >
              <Pencil size={iconSize} />
              <span className={styles.menuItemText}>
                Actualizar {selectedProducts.size > 0 && `(${selectedProducts.size})`}
              </span>
            </button>
            
            <button
              onClick={() => handleAction(handleBulkDelete, setShowProductMenu)}
              className={`${styles.menuItem} ${styles.deleteButton} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
              disabled={selectedProducts.size === 0}
              title="Borrar productos seleccionados"
            >
              <Trash2 size={iconSize} />
              <span className={styles.menuItemText}>
                Borrar {selectedProducts.size > 0 && `(${selectedProducts.size})`}
              </span>
            </button>
            
            <div className={styles.menuDivider}></div>
            
            <button
              onClick={() => handleAction(toggleFilters, setShowProductMenu)}
              className={`${styles.menuItem} ${showFilters ? styles.filterActive : ''}`}
              title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <Filter size={iconSize} />
              <span className={styles.menuItemText}>
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </span>
              {activeFiltersCount > 0 && (
                <span className={styles.filterBadge}>{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Package Actions Menu */}
      <div className={`${styles.packageMenuContainer} ${showPackageMenu ? styles.menuOpen : ''}`}>
        <button
          onClick={() => {
            setShowPackageMenu(!showPackageMenu);
            setShowProductMenu(false); // Close other menu
          }}
          className={`${styles.dropdownButton} ${showPackageMenu ? styles.active : ''}`}
          title="Acciones de paquetes"
        >
          <Box size={isSmallScreen ? 18 : 20} />
          <span className={styles.dropdownButtonText}>Paquetes</span>
          <ChevronDown 
            size={isSmallScreen ? 14 : 16} 
            className={`${styles.dropdownArrow} ${showPackageMenu ? styles.rotated : ''}`}
          />
        </button>
        
        <div className={`${styles.menuDropdown} ${showPackageMenu ? styles.open : ''}`}>
          <div className={styles.menuContent}>
            <button
              onClick={() => handleAction(handleCreatePackage, setShowPackageMenu)}
              className={`${styles.menuItem} ${styles.createButton} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
              disabled={selectedProducts.size === 0}
              title="Crear paquete con productos seleccionados"
            >
              <Package size={iconSize} />
              <span className={styles.menuItemText}>
                Crear Paquete {selectedProducts.size > 0 && `(${selectedProducts.size})`}
              </span>
            </button>
            
            <button
              onClick={() => handleAction(navigateToPackages, setShowPackageMenu)}
              className={styles.menuItem}
              title="Ver lista de paquetes"
            >
              <PackageOpen size={iconSize} />
              <span className={styles.menuItemText}>Ver Paquetes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;