import { useEffect, useState } from 'react';
import { useProduct } from '../../app_context/ProductContext.jsx';
import styles from '../../../../public/css/FiltersForProducts.module.css';
import { Calendar, Package, Percent, RefreshCw, EyeOff } from 'lucide-react';
import useFiltersForProducts from './FiltersForProductsUtils';
import CustomToggleSwitch from '../navigation_components/CustomToggleSwitch.jsx';
import PropTypes from 'prop-types'; // UPDATE: Added PropTypes import for prop validation

const FiltersForProducts = ({ onResetFilters }) => {

  const { 
    filterOptions, 
    filters, 
    productTypesAndSubtypes,
  } = useProduct();

  // State to track active filter count for UI
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const {
    handleFilterChange,
    handleOnSaleChange,
    handleExcessChange,
    handleNearExpirationChange,
    handleSecondHandChange,
    handleNewProductsChange,
    handleShowInactiveChange,
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
    <div className={styles.filtersContainer}>
      <div className={styles.filterControls}>
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

          {/* Type Filter */}
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

          {/* Subtype Filter */}
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

          {/* Rating Filter */}
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

          {/* New Products Filter */}
          <div className={styles.filterWrapper}>
            <select
              value={filters.nuevos_productos || ""}
              onChange={handleNewProductsChange}
              className={`${styles.filterSelect} ${filters.nuevos_productos ? styles.hasValue : ''}`}
            >
              <option value="">Por fecha de creación</option>
              <option value="today">Hoy</option>
              <option value="last_week">Última semana</option>
              <option value="last_month">Último mes</option>
            </select>
          </div>
        </div>

        {/* Checkbox Filters Row */}
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
          
          {/* Second Hand Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <RefreshCw size={14} />
                <span>Segunda mano</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.second_hand === 'Sí'}
                onChange={(isChecked) => {
                  handleSecondHandChange({
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

          {/* Show Inactive Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <EyeOff size={14} />
                <span>Mostrar inactivos</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.mostrar_inactivos === 'Sí'}
                onChange={(isChecked) => {
                  handleShowInactiveChange({
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

// UPDATE: Added PropTypes validation for the onResetFilters prop
FiltersForProducts.propTypes = {
  onResetFilters: PropTypes.func
};

// UPDATE: Added defaultProps to specify default behavior when prop is not provided
FiltersForProducts.defaultProps = {
  onResetFilters: null
};

export default FiltersForProducts;