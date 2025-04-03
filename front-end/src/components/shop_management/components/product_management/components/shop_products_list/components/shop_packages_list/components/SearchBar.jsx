import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import styles from '../../../../../../../../../../../public/css/ShopPackagesList.module.css';

const SearchBar = ({ searchTerm, handleSearchChange, placeholder = 'Buscar paquetes...' }) => {
  // 📱 Add state to track screen size for responsiveness
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 480);
  
  // 📱 Add responsive placeholder text based on screen size
  const [displayPlaceholder, setDisplayPlaceholder] = useState(placeholder);
  
  // 📱 Track window resize
  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 480;
      setIsSmallScreen(smallScreen);
      setDisplayPlaceholder(smallScreen ? 'Buscar...' : placeholder);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, [placeholder]);
  
  // 🌟 Enhanced search bar with full width and improved styling
  return (
    <div className={styles.searchInputWrapper}>
      <Search 
        size={isSmallScreen ? 16 : 18} 
        className={styles.searchIcon} 
        strokeWidth={3}
        color="white"
      />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={displayPlaceholder}
        className={styles.searchInput}
        aria-label="Buscar"
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