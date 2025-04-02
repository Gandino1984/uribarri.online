import React, { useState, useEffect } from 'react';
import { PackagePlus, Pencil, Trash2, Filter, ChevronDown } from 'lucide-react';
import styles from '../../../../../../../../../public/css/ShopProductsList.module.css';

const ActionButtons = ({ 
  handleAddProduct, 
  handleBulkUpdate, 
  handleBulkDelete, 
  toggleFilters, 
  showFilters, 
  selectedProducts, 
  activeFiltersCount
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
  
  // 🔄 UPDATE: Added style to ensure consistent button widths even when text is hidden
  // const buttonStyle = isSmallScreen ? { minWidth: '36px', justifyContent: 'center' } : {};
  
  return (
    <div className={styles.buttonGroup}>
      <button
        onClick={handleAddProduct}
        className={`${styles.actionButton} ${styles.addButton}`}
        title="Añadir producto"
        // style={buttonStyle}
      >
        <PackagePlus size={iconSize} />
        <span className={styles.buttonText}>Añadir</span>
      </button>

      <button
        onClick={handleBulkUpdate}
        className={`${styles.actionButton} ${styles.updateButton}`}
        disabled={selectedProducts.size === 0}
        title="Actualizar producto"
        // style={buttonStyle}
      >
        <Pencil size={iconSize} />
        <span className={styles.buttonText}>Actualizar</span>
      </button>
      
      <button
        onClick={handleBulkDelete}
        className={`${styles.actionButton} ${styles.deleteButton}`}
        disabled={selectedProducts.size === 0}
        title="Borrar producto"
        // style={buttonStyle}
      >
        <Trash2 size={iconSize} />
        <span className={styles.buttonText}>Borrar</span>
      </button>
      
      {/* Filter Toggle Button with Animation */}
      <button
        onClick={toggleFilters}
        className={`${styles.actionButton} ${styles.filterButton} ${showFilters ? styles.active : ''}`}
        title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        // style={buttonStyle}
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
  );
};

export default ActionButtons;