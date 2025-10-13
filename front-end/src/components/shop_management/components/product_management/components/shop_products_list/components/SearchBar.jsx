import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from '../../../../../../../../public/css/ShopProductsList.module.css';

const SearchBar = ({ searchTerm, handleSearchChange }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 480);
  
  const [placeholder, setPlaceholder] = useState('Buscar productos...');
  
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 480;
      setIsSmallScreen(smallScreen);
      setPlaceholder(smallScreen ? 'Buscar...' : 'Buscar productos...');
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  
  return (
    <div className={styles.searchInputWrapper}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="Buscar productos"
      />
      {searchTerm && (
        <button 
          className={styles.clearSearchButton}
          onClick={() => handleSearchChange({ target: { value: '' } })}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
        >
          <X size={isSmallScreen ? 16 : 18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;