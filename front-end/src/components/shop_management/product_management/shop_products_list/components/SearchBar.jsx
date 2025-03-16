import React from 'react';
import { Search } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopProductsList.module.css';

const SearchBar = ({ searchTerm, handleSearchChange }) => {
  return (
    <div className={styles.searchInputWrapper}>
      <Search size={18} className={styles.searchIcon} />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Buscar productos..."
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchBar;