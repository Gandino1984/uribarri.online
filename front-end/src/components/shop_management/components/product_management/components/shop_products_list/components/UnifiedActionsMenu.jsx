//update: New unified actions menu component with slide-down animation
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu,
  X,
  ShoppingBag,
  Box,
  Layers2,
  SquarePlus,
  Pencil,
  Trash2,
  Filter,
  Package,
  PackageOpen,
  ChevronRight
} from 'lucide-react';
import { animated, useSpring } from '@react-spring/web';
import styles from '../../../../../../../../../public/css/UnifiedActionsMenu.module.css';

const UnifiedActionsMenu = ({ 
  handleAddProduct, 
  handleBulkUpdate, 
  handleBulkDelete, 
  toggleFilters, 
  handleCreatePackage,
  showFilters, 
  selectedProducts, 
  activeFiltersCount,
  navigateToPackages,
  showCategoryManagement,
  currentUser
}) => {
  //update: Main menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const menuRef = useRef(null);
  
  //update: Animation for slide-down effect
  const menuAnimation = useSpring({
    transform: isMenuOpen ? 'translateY(0%)' : 'translateY(-100%)',
    opacity: isMenuOpen ? 1 : 0,
    config: { tension: 280, friction: 24 }
  });
  
  //update: Handle menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setActiveSubmenu(null); // Reset submenus when opening main menu
    }
  };
  
  //update: Handle submenu toggle
  const toggleSubmenu = (menuName) => {
    if (activeSubmenu === menuName) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(menuName);
    }
  };
  
  //update: Handle action and close menu
  const handleAction = (action) => {
    action();
    setIsMenuOpen(false);
    setActiveSubmenu(null);
  };
  
  //update: Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setActiveSubmenu(null);
      }
    };
    
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  return (
    <div className={styles.menuContainer} ref={menuRef}>
      {/*update: Main burger button */}
      <button
        onClick={toggleMenu}
        className={`${styles.burgerButton} ${isMenuOpen ? styles.active : ''}`}
        title="Menú de acciones"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/*update: Animated dropdown menu */}
      <animated.div 
        style={menuAnimation} 
        className={`${styles.dropdownMenu} ${isMenuOpen ? styles.open : ''}`}
      >
        <div className={styles.menuContent}>
          {/*update: Products section */}
          <div className={styles.menuSection}>
            <button
              onClick={() => toggleSubmenu('products')}
              className={`${styles.sectionButton} ${activeSubmenu === 'products' ? styles.active : ''}`}
            >
              <ShoppingBag size={20} />
              <span>Productos</span>
              <ChevronRight 
                size={16} 
                className={`${styles.chevron} ${activeSubmenu === 'products' ? styles.rotated : ''}`}
              />
            </button>
            
            {activeSubmenu === 'products' && (
              <div className={styles.submenu}>
                <button
                  onClick={() => handleAction(handleAddProduct)}
                  className={styles.submenuItem}
                >
                  <SquarePlus size={18} />
                  <span>Crear Producto</span>
                </button>
                
                <button
                  onClick={() => handleAction(handleBulkUpdate)}
                  className={`${styles.submenuItem} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
                  disabled={selectedProducts.size === 0}
                >
                  <Pencil size={18} />
                  <span>
                    Actualizar {selectedProducts.size > 0 && `(${selectedProducts.size})`}
                  </span>
                </button>
                
                <button
                  onClick={() => handleAction(handleBulkDelete)}
                  className={`${styles.submenuItem} ${styles.deleteItem} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
                  disabled={selectedProducts.size === 0}
                >
                  <Trash2 size={18} />
                  <span>
                    Borrar {selectedProducts.size > 0 && `(${selectedProducts.size})`}
                  </span>
                </button>
                
                <button
                  onClick={() => handleAction(toggleFilters)}
                  className={`${styles.submenuItem} ${showFilters ? styles.filterActive : ''}`}
                >
                  <Filter size={18} />
                  <span>
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className={styles.badge}>{activeFiltersCount}</span>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/*update: Packages section */}
          <div className={styles.menuSection}>
            <button
              onClick={() => toggleSubmenu('packages')}
              className={`${styles.sectionButton} ${activeSubmenu === 'packages' ? styles.active : ''}`}
            >
              <Box size={20} />
              <span>Paquetes</span>
              <ChevronRight 
                size={16} 
                className={`${styles.chevron} ${activeSubmenu === 'packages' ? styles.rotated : ''}`}
              />
            </button>
            
            {activeSubmenu === 'packages' && (
              <div className={styles.submenu}>
                <button
                  onClick={() => handleAction(handleCreatePackage)}
                  className={`${styles.submenuItem} ${selectedProducts.size === 0 ? styles.disabled : ''}`}
                  disabled={selectedProducts.size === 0}
                >
                  <Package size={18} />
                  <span>
                    Crear Paquete {selectedProducts.size > 0 && `(${selectedProducts.size})`}
                  </span>
                </button>
                
                <button
                  onClick={() => handleAction(navigateToPackages)}
                  className={styles.submenuItem}
                >
                  <PackageOpen size={18} />
                  <span>Ver Paquetes</span>
                </button>
              </div>
            )}
          </div>
          
          {/*update: Categories section - only show if user is contributor */}
          {currentUser?.contributor_user && (
            <div className={styles.menuSection}>
              <button
                onClick={() => handleAction(showCategoryManagement)}
                className={styles.sectionButton}
              >
                <Layers2 size={20} />
                <span>Categorías</span>
              </button>
            </div>
          )}
        </div>
      </animated.div>
    </div>
  );
};

export default UnifiedActionsMenu;