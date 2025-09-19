// src/components/info_management/components/filters_for_organizations/FiltersForOrganizations.jsx
import React, { useState } from 'react';
import { useOrganization } from '../../../../app_context/OrganizationContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { Search, X } from 'lucide-react';
import styles from '../../../../../../public/css/FiltersForOrganizations.module.css';

const FiltersForOrganizations = () => {
  const {
    searchTerm,
    setSearchTerm,
    searchOrganizations,
    fetchAllOrganizations,
    isSearching
  } = useOrganization();
  
  const { setError } = useUI();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    
    // If clearing the search, reset
    if (value === '') {
      handleClearSearch();
    }
  };

  // Handle search submit
  const handleSearch = async () => {
    if (localSearchTerm.trim() === '' && !hasSearched) {
      // If no search term and haven't searched yet, fetch all
      await fetchAllOrganizations();
      setHasSearched(true);
    } else if (localSearchTerm.trim() !== '') {
      // Search with the term
      setSearchTerm(localSearchTerm);
      await searchOrganizations(localSearchTerm);
      setHasSearched(true);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setHasSearched(false);
    // Don't automatically fetch all - wait for user to search again
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Buscar por nombre de asociación..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
            disabled={isSearching}
          />
          {localSearchTerm && (
            <button
              className={styles.clearButton}
              onClick={handleClearSearch}
              type="button"
              title="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <button
          className={`${styles.searchButton} ${isSearching ? styles.searching : ''}`}
          onClick={handleSearch}
          disabled={isSearching}
          type="button"
        >
          {isSearching ? (
            <>
              <span className={styles.loadingSpinner}></span>
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Buscar asociación</span>
            </>
          )}
        </button>
      </div>

      {hasSearched && localSearchTerm && (
        <div className={styles.searchInfo}>
          <p>Resultados para: <strong>"{localSearchTerm}"</strong></p>
        </div>
      )}
    </div>
  );
};

export default FiltersForOrganizations;