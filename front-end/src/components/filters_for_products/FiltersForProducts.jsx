import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../app_context/AppContext.js';
import styles from '../../../../public/css/FiltersForProducts.module.css';
import { Calendar, Package, Percent } from 'lucide-react';
import useFiltersForProducts from './FiltersForProductsUtils';
import CustomToggleSwitch from '../navigation_components/CustomToggleSwitch.jsx';

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


  return (
    <div  className={styles.filtersContainer}>
      <div  className={styles.filterControls}>
        {/* Select Filters Row */}
        <div className={styles.selectFiltersRow}>
          {/* Season Filter */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.temporada || ""}
              onChange={(e) => handleFilterChange('temporada', e.target.value)}
              className={`${styles.filterSelect} ${filters.temporada ? styles.hasValue : ''}`}
            >
              <option value="">Por temporada</option>
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
              <option value="">Por tipo de producto</option>
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
                <option value="">Por subtipo de producto</option>
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
              <option value="">Por calificación</option>
              {filterOptions.calificacion.options.map((option) => (
                <option key={option} value={option}>
                  {option} ⭐
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox Filters Row - UPDATE: Replaced checkboxes with CustomToggleSwitch with fixed event handling */}
        <div className={styles.checkboxFiltersRow}>
          {/* Discount Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <Percent size={14} />
                <span>Con descuento</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.oferta === 'Sí'}
                onChange={(isChecked) => {
                  handleOnSaleChange({
                    target: {
                      checked: isChecked
                    }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
          </div>

          {/* Surplus Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <Package size={14} />
                <span>Con excedentes</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.excedente === 'Sí'}
                onChange={(isChecked) => {
                  handleExcessChange({
                    target: {
                      checked: isChecked
                    }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
          </div>

          {/* Near Expiration Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer} title="Productos que caducan en los próximos 7 días">
              <span className={styles.toggleIconLabel}>
                <Calendar size={14} />
                <span>Caduca (10 días)</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.proxima_caducidad === 'Sí'}
                onChange={(isChecked) => {
                  handleNearExpirationChange({
                    target: {
                      checked: isChecked
                    }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
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
      </div>
    </div>
  );
};

export default FiltersForProducts;