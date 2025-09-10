import { useEffect, useState } from 'react';
import styles from '../../../../../public/css/FiltersForShops.module.css';
import { 
  Store, 
  Truck, 
  Clock, 
  Star, 
  Calendar,
  Search,
  X 
} from 'lucide-react';
import CustomToggleSwitch from '../../navigation_components/CustomToggleSwitch.jsx';
import PropTypes from 'prop-types';

//update: Added onClose prop to handle closing the filters
const FiltersForShops = ({ 
  searchTerm,
  filters,
  shopTypesAndSubtypes,
  activeFilterCount,
  handleFilterChange,
  handleSearchChange,
  handleDeliveryChange,
  handleOpenNowChange,
  handleTopRatedChange,
  handleDayChange,
  handleResetFilters,
  getAvailableSubtypes,
  onClose = null
}) => {
  // Days of the week for filter
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Handle search change
  const handleSearch = (e) => {
    handleSearchChange(e);
  };

  //update: Handle close button click
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className={styles.filtersContainer}>
      {/*update: Add close button at top right corner */}
      <button 
        onClick={handleClose}
        className={styles.closeButton}
        type="button"
        title="Cerrar filtros"
      >
        <X size={20} />
      </button>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar comercios por nombre, tipo, etc"
            className={styles.searchInput}
            title='Buscar comercios por nombre, tipo o ubicación...'
            aria-label="Buscar comercios"
          />
          {searchTerm && (
            <button 
              className={styles.clearSearchButton}
              onClick={() => handleSearch({ target: { value: '' } })}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterControls}>
        {/* Select Filters Row */}
        <div className={styles.selectFiltersRow}>
          {/* Shop Type Filter */}
          <div className={styles.filterWrapper}>
            {/* <Store size={16} className={styles.filterIcon} /> */}
            <select
              value={filters.tipo_comercio || ""}
              onChange={(e) => handleFilterChange('tipo_comercio', e.target.value)}
              className={`${styles.filterSelect} ${filters.tipo_comercio ? styles.hasValue : ''}`}
            >
              <option value="">Todos los tipos</option>
              {Object.keys(shopTypesAndSubtypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Subtype Filter - Only show if type is selected */}
          {filters.tipo_comercio && (
            <div className={styles.filterWrapper}>
              <select
                value={filters.subtipo_comercio || ""}
                onChange={(e) => handleFilterChange('subtipo_comercio', e.target.value)}
                className={`${styles.filterSelect} ${filters.subtipo_comercio ? styles.hasValue : ''}`}
              >
                <option value="">Todos los subtipos</option>
                {getAvailableSubtypes().map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Week Filter */}
          <div className={styles.filterWrapper}>
            {/* <Calendar size={16} className={styles.filterIcon} /> */}
            <select
              value={filters.dia_semana || ""}
              onChange={(e) => handleDayChange(e.target.value)}
              className={`${styles.filterSelect} ${filters.dia_semana ? styles.hasValue : ''}`}
            >
              <option value="">Abierto cualquier día</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  Abierto {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Filters Row */}
        <div className={styles.checkboxFiltersRow}>
          {/* Delivery Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <Truck size={14} />
                <span>Con delivery</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.con_delivery === 'Sí'}
                onChange={(isChecked) => {
                  handleDeliveryChange({
                    target: { checked: isChecked }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <Clock size={14} />
                <span>Abierto ahora</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.abierto_ahora === 'Sí'}
                onChange={(isChecked) => {
                  handleOpenNowChange({
                    target: { checked: isChecked }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
          </div>

          {/* Top Rated Toggle */}
          <div className={styles.toggleFilterWrapper}>
            <div className={styles.toggleSwitchContainer}>
              <span className={styles.toggleIconLabel}>
                <Star size={14} />
                <span>Mejor valorados</span>
              </span>
              <CustomToggleSwitch 
                checked={filters.mejor_valorados === 'Sí'}
                onChange={(isChecked) => {
                  handleTopRatedChange({
                    target: { checked: isChecked }
                  });
                }}
                leftLabel="No"
                rightLabel="Sí"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className={styles.resetButtonWrapper}>
          <button
            onClick={handleResetFilters}
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

//update: Add PropTypes for documentation and type-checking
FiltersForShops.propTypes = {
  searchTerm: PropTypes.string,
  filters: PropTypes.object,
  shopTypesAndSubtypes: PropTypes.object,
  activeFilterCount: PropTypes.number,
  handleFilterChange: PropTypes.func,
  handleSearchChange: PropTypes.func,
  handleDeliveryChange: PropTypes.func,
  handleOpenNowChange: PropTypes.func,
  handleTopRatedChange: PropTypes.func,
  handleDayChange: PropTypes.func,
  handleResetFilters: PropTypes.func,
  getAvailableSubtypes: PropTypes.func,
  onClose: PropTypes.func
};

export default FiltersForShops;