//update: front-end/src/components/info_management/components/info_board/components/FiltersForPublications.jsx
import { useEffect, useState } from 'react';
import { usePublication } from '../../../../../app_context/PublicationContext.jsx';
import { useOrganization } from '../../../../../app_context/OrganizationContext.jsx';
import { Search, X, Calendar, Building2, User } from 'lucide-react';
import styles from '../../../../../../../public/css/FiltersForPublications.module.css';

const FiltersForPublications = ({ onClose = null }) => {
  const { 
    filters,
    updateFilter,
    resetFilters,
    publications
  } = usePublication();
  
  const { organizations } = useOrganization();
  
  //update: Local state for search input (controlled component)
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');

  //update: Sync local search input with context when context changes
  useEffect(() => {
    setSearchInput(filters.searchTerm || '');
  }, [filters.searchTerm]);

  //update: Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Debounce: update context after user stops typing
    const timeoutId = setTimeout(() => {
      updateFilter('searchTerm', value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  //update: Handle organization filter change
  const handleOrgFilterChange = (e) => {
    const value = e.target.value;
    updateFilter('filterByOrganization', value === '' ? null : parseInt(value));
  };

  //update: Handle user filter change
  const handleUserFilterChange = (e) => {
    const value = e.target.value;
    updateFilter('filterByUser', value === '' ? null : parseInt(value));
  };

  //update: Handle sort order change
  const handleSortChange = (e) => {
    const value = e.target.value;
    updateFilter('sortOrder', value);
  };

  //update: Handle search submit (optional - filter happens on change)
  const handleSearch = () => {
    updateFilter('searchTerm', searchInput);
  };

  //update: Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  //update: Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  //update: Handle close button click
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  //update: Get approved organizations only for public filter
  const getApprovedOrganizations = () => {
    if (!organizations) return [];
    return organizations.filter(org => org.org_approved === true);
  };

  //update: Get unique publishers from publications
  const getUniquePublishers = () => {
    if (!publications) return [];
    const publishersMap = new Map();
    publications.forEach(pub => {
      if (pub.publisher && pub.publisher.id_user) {
        publishersMap.set(pub.publisher.id_user, pub.publisher.name_user);
      }
    });
    return Array.from(publishersMap, ([id, name]) => ({ id, name }));
  };

  const approvedOrgs = getApprovedOrganizations();
  const uniquePublishers = getUniquePublishers();
  
  //update: Check if any filters are active
  const hasActiveFilters = 
    searchInput !== '' || 
    filters.filterByOrganization !== null || 
    filters.filterByUser !== null ||
    filters.sortOrder !== 'newest';

  return (
    <div className={styles.container}>
      {onClose && (
        <button 
          onClick={handleClose}
          className={styles.closeButton}
          type="button"
          title="Cerrar filtros"
        >
          <X size={20} />
        </button>
      )}

      <div className={styles.filtersWrapper}>
        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por título, contenido, usuario o asociación..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            {searchInput && (
              <button
                className={styles.clearSearchButton}
                onClick={() => {
                  setSearchInput('');
                  updateFilter('searchTerm', '');
                }}
                type="button"
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className={styles.filterRow}>
          {/* Organization Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="org-filter" className={styles.filterLabel}>
              <Building2 size={16} />
              <span>Asociación:</span>
            </label>
            <select
              id="org-filter"
              value={filters.filterByOrganization || ''}
              onChange={handleOrgFilterChange}
              className={`${styles.filterSelect} ${filters.filterByOrganization ? styles.hasValue : ''}`}
            >
              <option value="">Todas las asociaciones</option>
              {approvedOrgs.map(org => (
                <option key={org.id_organization} value={org.id_organization}>
                  {org.name_org}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="user-filter" className={styles.filterLabel}>
              <User size={16} />
              <span>Usuario:</span>
            </label>
            <select
              id="user-filter"
              value={filters.filterByUser || ''}
              onChange={handleUserFilterChange}
              className={`${styles.filterSelect} ${filters.filterByUser ? styles.hasValue : ''}`}
            >
              <option value="">Todos los usuarios</option>
              {uniquePublishers.map(publisher => (
                <option key={publisher.id} value={publisher.id}>
                  {publisher.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="sort-filter" className={styles.filterLabel}>
              <Calendar size={16} />
              <span>Ordenar:</span>
            </label>
            <select
              id="sort-filter"
              value={filters.sortOrder}
              onChange={handleSortChange}
              className={`${styles.filterSelect} ${filters.sortOrder !== 'newest' ? styles.hasValue : ''}`}
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className={styles.clearFiltersWrapper}>
            <button
              onClick={handleClearFilters}
              className={styles.clearFiltersButton}
              type="button"
            >
              <X size={16} />
              <span>Limpiar filtros</span>
            </button>
          </div>
        )}

        {/* Active Filter Info */}
        {(filters.filterByOrganization || filters.filterByUser || searchInput) && (
          <div className={styles.activeFiltersInfo}>
            {filters.filterByOrganization && (
              <span className={styles.activeFilter}>
                Asociación: {approvedOrgs.find(o => o.id_organization === filters.filterByOrganization)?.name_org}
              </span>
            )}
            {filters.filterByUser && (
              <span className={styles.activeFilter}>
                Usuario: {uniquePublishers.find(u => u.id === filters.filterByUser)?.name}
              </span>
            )}
            {searchInput && (
              <span className={styles.activeFilter}>
                Búsqueda: "{searchInput}"
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersForPublications;