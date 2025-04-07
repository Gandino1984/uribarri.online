import React, { useState, useEffect } from 'react';
import { 
  SquarePlus, 
  Pencil, 
  Trash2, 
  Filter, 
  ChevronDown,
  Package,
  PackageOpen // 🔄 FIXED: Changed from 'Packages' to 'PackageOpen' which is available in lucide-react
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
  // 📱 UPDATE: Add state to track if we're on a small screen
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);
  
  // 📱 UPDATE: Set icon size based on screen size
  const [iconSize, setIconSize] = useState(17);
  
  // 📱 UPDATE: Set filter button animation styles
  const [filterButtonAnimation, setFilterButtonAnimation] = useState({
    transform: 'rotate(0deg)',
    transition: 'transform 0.3s ease'
  });
  
  // 📱 UPDATE: Update filter button animation when showFilters changes
  useEffect(() => {
    setFilterButtonAnimation({
      transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease'
    });
  }, [showFilters]);
  
  // 📱 UPDATE: Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 600;
      setIsSmallScreen(smallScreen);
      setIconSize(smallScreen ? 16 : 17);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={styles.buttonGroup}>
      <div className={styles.buttonGroupRow1}>
      <button
        onClick={handleAddProduct}
        className={`${styles.actionButton} ${styles.addButton}`}
        title="Añadir producto"
      >
        <SquarePlus size={iconSize} />
        <span className={styles.buttonText}>Crear</span>
      </button>

      <button
        onClick={handleBulkUpdate}
        className={`${styles.actionButton} ${styles.updateButton}`}
        disabled={selectedProducts.size === 0}
        title="Actualizar producto"
      >
        <Pencil size={iconSize} />
        <span className={styles.buttonText}>Actualizar</span>
      </button>
      
      <button
        onClick={handleBulkDelete}
        className={`${styles.actionButton} ${styles.deleteButton}`}
        disabled={selectedProducts.size === 0}
        title="Borrar producto"
      >
        <Trash2 size={iconSize} />
        <span className={styles.buttonText}>Borrar</span>
      </button>
      
      {/* Filter Toggle Button with Animation */}
      <button
        onClick={toggleFilters}
        className={`${styles.actionButton} ${styles.filterButton} ${showFilters ? styles.active : ''}`}
        title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      >
        <Filter size={iconSize} />
        <span className={styles.buttonText}>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className={styles.filterBadge}>{activeFiltersCount}</span>
        )}
        <div style={filterButtonAnimation} className={styles.filterButtonIcon}>
          <ChevronDown size={isSmallScreen ? 12 : 14} />
        </div>
      </button>
      </div>
      

      <div className={styles.buttonGroupRow2}>
      <button
        onClick={handleCreatePackage}
        className={`${styles.actionButton} ${styles.packageButton}`}
        disabled={selectedProducts.size === 0}
        title="Crear paquete con productos seleccionados"
      >
        <Package size={iconSize} />
        <span className={styles.buttonText}>Crear paquete</span>
      </button>
      
      {/* 🔄 UPDATE: Fixed button to navigate to packages view with correct icon */}
      <button
        onClick={navigateToPackages}
        className={`${styles.actionButton} ${styles.viewPackagesButton}`}
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