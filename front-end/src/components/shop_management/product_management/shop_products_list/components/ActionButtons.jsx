import React from 'react';
import { PackagePlus, Pencil, Trash2, Filter, ChevronDown } from 'lucide-react';
// import { animated } from 'react-spring';
import styles from '../../../../../../../public/css/ShopProductsList.module.css';

const ActionButtons = ({ 
  handleAddProduct, 
  handleBulkUpdate, 
  handleBulkDelete, 
  toggleFilters, 
  showFilters, 
  selectedProducts, 
  activeFiltersCount,
  filterButtonAnimation 
}) => {
  return (
    <div className={styles.buttonGroup}>
      <button
        onClick={handleAddProduct}
        className={`${styles.actionButton} ${styles.addButton}`}
        title="Añadir producto"
      >
        <PackagePlus size={17} />
        <span className={styles.buttonText}>Añadir</span>
      </button>

      <button
        onClick={handleBulkUpdate}
        className={`${styles.actionButton} ${styles.updateButton}`}
        disabled={selectedProducts.size === 0}
        title="Actualizar producto"
      >
        <Pencil size={17} />
        <span className={styles.buttonText}>Actualizar</span>
      </button>
      
      <button
        onClick={handleBulkDelete}
        className={`${styles.actionButton} ${styles.deleteButton}`}
        disabled={selectedProducts.size === 0}
        title="Borrar producto"
      >
        <Trash2 size={17} />
        <span className={styles.buttonText}>Borrar</span>
      </button>
      
      {/* Filter Toggle Button with Animation */}
      <button
        onClick={toggleFilters}
        className={`${styles.actionButton} ${styles.filterButton} ${showFilters ? styles.active : ''}`}
        title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      >
        <Filter size={17} />
        <span className={styles.buttonText}>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className={styles.filterBadge}>{activeFiltersCount}</span>
        )}
        <div style={filterButtonAnimation} className={styles.filterButtonIcon}>
          <ChevronDown size={14} />
        </div>
      </button>
    </div>
  );
};

export default ActionButtons;