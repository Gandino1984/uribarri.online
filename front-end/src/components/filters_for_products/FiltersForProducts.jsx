import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import styles from '../../../../public/css/FiltersForProducts.module.css';
import { useSpring, animated, config } from '@react-spring/web';

const FiltersForProducts = () => {
  const { 
    filterOptions, 
    filters, 
    setFilters,
    productTypesAndSubtypes,
  } = useContext(AppContext);

  const [isVisible, setIsVisible] = useState(false);

  // Animation for the entire filters container
  const containerAnimation = useSpring({
    from: { transform: 'translateY(50px)', opacity: 0 },
    to: { 
      transform: isVisible ? 'translateY(0px)' : 'translateY(50px)',
      opacity: isVisible ? 1 : 0 
    },
    config: config.gentle,
    delay: 200
  });

  // Set visibility after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle main filter changes
  const handleFilterChange = (filterName, option) => {
    const normalizedOption = option === "" ? null : option;
    
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterName]: normalizedOption,
      };

      if (filterName === 'tipo') {
        newFilters.subtipo = null;
      }

      return newFilters;
    });
  };

  const handleOnSaleChange = (e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      oferta: e.target.checked ? 'Sí' : null
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      temporada: null,
      tipo: null,
      subtipo: null,
      oferta: null,
      calificacion: null,
    });
  };

  const getAvailableSubtypes = () => {
    if (!filters.tipo || !productTypesAndSubtypes[filters.tipo]) {
      return [];
    }
    return productTypesAndSubtypes[filters.tipo];
  };

  return (
    <animated.div style={containerAnimation} className={styles.filtersContainer}>
      <div className={styles.filterControls}>
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

        {/* Discount Checkbox */}
        <div className={styles.filterWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.oferta === 'Sí'}
              onChange={handleOnSaleChange}
              className={styles.checkbox}
            />
            En oferta
          </label>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={handleResetFilters}
          className={styles.resetButton}
          type="button"
        >
          Limpiar filtros
        </button>
      </div>
    </animated.div>
  );
};

export default FiltersForProducts;