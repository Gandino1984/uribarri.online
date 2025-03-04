import React, { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import styles from '../../../../public/css/FiltersForProducts.module.css';
import { useSpring, animated, config } from '@react-spring/web';
import { Search, Calendar, Package } from 'lucide-react';
import useFiltersForProducts from './FiltersForProductsFunctions';

const FiltersForProducts = () => {
  const { 
    filterOptions, 
    filters, 
    productTypesAndSubtypes,
  } = useContext(AppContext);

  const {
    isVisible,
    searchTerm,
    expirationDateRange,
    handleFilterChange,
    handleSearchChange,
    handleOnSaleChange,
    handleExcessChange,
    handleExpirationChange,
    handleNearExpirationChange,
    handleResetFilters,
    getAvailableSubtypes
  } = useFiltersForProducts();

  // Animation for the entire filters container
  const containerAnimation = useSpring({
    from: { transform: 'translateY(30px)', opacity: 0 },
    to: { 
      transform: isVisible ? 'translateY(0px)' : 'translateY(30px)',
      opacity: isVisible ? 1 : 0 
    },
    config: config.gentle,
    delay: 200
  });

  return (
    <animated.div style={containerAnimation} className={styles.filtersContainer}>
      <div className={styles.filterControls}>
        {/* UPDATE: Reorganized select filters into a row */}
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

          {/* Type Filter */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.tipo || ""}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Tipo de producto</option>
              {Object.keys(productTypesAndSubtypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Subtype Filter */}
          {filters.tipo && (
            <div className={styles.filterWrapper}>
              <select
                value={filters.subtipo || ""}
                onChange={(e) => handleFilterChange('subtipo', e.target.value)}
                className={styles.filterSelect}
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

          {/* Rating Filter */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.calificacion || ""}
              onChange={(e) => handleFilterChange('calificacion', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Calificación</option>
              {filterOptions.calificacion.options.map((option) => (
                <option key={option} value={option}>
                  {option} ⭐ o más
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* UPDATE: Checkbox Filters Row with improved structure */}
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
            Oferta
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

          {/* Near Expiration Checkbox */}
          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel} title="Caducidad de 7 días">
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

        {/* Expiration Date Range with improved structure */}
        <div className={styles.dateRangeContainer}>
          <div className={styles.dateLabel}>
            <Calendar size={14} />
            <span>Rango de caducidad:</span>
          </div>
          <div className={styles.dateInputs}>
            <input
              type="date"
              name="start"
              value={expirationDateRange.start}
              onChange={handleExpirationChange}
              className={styles.dateInput}
              placeholder="Desde"
            />
            <span>-</span>
            <input
              type="date"
              name="end"
              value={expirationDateRange.end}
              onChange={handleExpirationChange}
              className={styles.dateInput}
              placeholder="Hasta"
            />
          </div>
        </div>

        <div className={styles.resetButtonWrapper}>
            <button
            onClick={handleResetFilters}
            className={styles.resetButton}
            type="button"
            >
                Borrar filtros
            </button>
          </div>
      </div>
    </animated.div>
  );
};

export default FiltersForProducts;