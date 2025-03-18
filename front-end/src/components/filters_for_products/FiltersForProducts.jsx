import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../app_context/AppContext.js';
import styles from '../../../../public/css/FiltersForProducts.module.css';
import { useSpring, animated, config } from '@react-spring/web';
import { Search, Calendar, Package, Percent, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import useFiltersForProducts from './FiltersForProductsFunctions';

const FiltersForProducts = ({ isVisible, searchTerm, setSearchTerm, onResetFilters }) => {
  const { 
    filterOptions, 
    filters, 
    productTypesAndSubtypes,
  } = useContext(AppContext);

  // State to track active filter count for UI
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const {
    handleFilterChange,
    handleSearchChange,
    handleOnSaleChange,
    handleExcessChange,
    handleNearExpirationChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount
  } = useFiltersForProducts();

  // Effect to update active filter count when dependencies change
  useEffect(() => {
    setActiveFilterCount(getActiveFiltersCount());
  }, [filters, getActiveFiltersCount]);

  // Custom reset function that uses the passed onResetFilters prop
  const handleCompleteReset = () => {
    // If we have the custom reset function from the parent, use it
    if (typeof onResetFilters === 'function') {
      onResetFilters();
    } else {
      // Otherwise fall back to the default reset
      handleResetFilters();
    }
  };

  // Enhanced folding animation
  const containerAnimation = useSpring({
    from: { 
      opacity: 0,
      height: 0,
      transform: 'perspective(500px) rotateX(-10deg)',
      transformOrigin: 'top'
    },
    to: { 
      opacity: isVisible ? 1 : 0,
      height: isVisible ? 'auto' : 0,
      transform: isVisible 
        ? 'perspective(500px) rotateX(0deg)' 
        : 'perspective(500px) rotateX(-10deg)',
      transformOrigin: 'top'
    },
    config: {
      tension: 280,
      friction: 30,
      clamp: true
    }
  });

  // Content opacity and transform - separate to allow different timing
  const contentAnimation = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(-20px)'
    },
    to: { 
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0px)' : 'translateY(-20px)'
    },
    config: {
      tension: 280,
      friction: 30
    },
    delay: isVisible ? 100 : 0 // Small delay on appearance for better sequential animation
  });

  return (
    <animated.div style={containerAnimation} className={styles.filtersContainer}>
      <animated.div style={contentAnimation} className={styles.filterControls}>
        {/* Select Filters Row */}
        <div className={styles.selectFiltersRow}>
          {/* Season Filter */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.temporada || ""}
              onChange={(e) => handleFilterChange('temporada', e.target.value)}
              className={`${styles.filterSelect} ${filters.temporada ? styles.hasValue : ''}`}
            >
              <option value="">Temporada</option>
              {filterOptions.temporada.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter - UPDATE: Added hasValue class */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.tipo || ""}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className={`${styles.filterSelect} ${filters.tipo ? styles.hasValue : ''}`}
            >
              <option value="">Tipo de producto</option>
              {Object.keys(productTypesAndSubtypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Subtype Filter - UPDATE: Added hasValue class */}
          {filters.tipo && (
            <div className={styles.filterWrapper}>
              <select
                value={filters.subtipo || ""}
                onChange={(e) => handleFilterChange('subtipo', e.target.value)}
                className={`${styles.filterSelect} ${filters.subtipo ? styles.hasValue : ''}`}
              >
                <option value="">Subtipo</option>
                {getAvailableSubtypes().map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Filter - UPDATE: Added hasValue class */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.calificacion || ""}
              onChange={(e) => handleFilterChange('calificacion', e.target.value)}
              className={`${styles.filterSelect} ${filters.calificacion ? styles.hasValue : ''}`}
            >
              <option value="">Calificación</option>
              {filterOptions.calificacion.options.map((option) => (
                <option key={option} value={option}>
                  {option} ⭐
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox Filters Row */}
        <div className={styles.checkboxFiltersRow}>
          {/* Discount Checkbox */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.oferta === 'Sí'}
                onChange={handleOnSaleChange}
                className={styles.checkbox}
              />
              <Percent size={14} />
              Descuento
            </label>
          </div>

          {/* Surplus Checkbox */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.excedente === 'Sí'}
                onChange={handleExcessChange}
                className={styles.checkbox}
              />
              <Package size={14} />
              Excedente
            </label>
          </div>

          {/* Improved Near Expiration Checkbox with tooltip */}
          <div className={styles.checkboxWrapper}>
            <label 
              className={styles.checkboxLabel} 
              title="Productos que caducan en los próximos 7 días"
            >
              <input
                type="checkbox"
                checked={filters.proxima_caducidad === 'Sí'}
                onChange={handleNearExpirationChange}
                className={styles.checkbox}
              />
              <Calendar size={14} />
              Caducidad
            </label>
          </div>
        </div>

        {/* Added active filter count to reset button */}
        <div className={styles.resetButtonWrapper}>
          <button
            onClick={handleCompleteReset}
            className={styles.resetButton}
            type="button"
          >
            Borrar filtros
            {activeFilterCount > 0 && (
              <span className={styles.filterCount}>{activeFilterCount}</span>
            )}
          </button>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default FiltersForProducts;