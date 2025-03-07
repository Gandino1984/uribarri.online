import { useState, useEffect, useContext, useCallback } from 'react';
import AppContext from '../../app_context/AppContext.js';

const FiltersForProductsFunctions = () => {
  const { 
    filters, 
    setFilters,
    products,
    setFilteredProducts,
    productTypesAndSubtypes,
  } = useContext(AppContext);

  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // UPDATE: Removed expirationDateRange state since we're removing the interval filter
  
  // UPDATE: Using useState instead of a ref for the timeout
  const [filterUpdateTimeout, setFilterUpdateTimeout] = useState(null);

  // Set visibility after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // UPDATE: Fixed function to count active filters
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    
    // Count each actively selected filter
    Object.entries(filters).forEach(([key, value]) => {
      // Only count values that represent a user's active selection
      if (value !== null && value !== '' && value !== 0 && value !== false) {
        count++;
      }
    });
    
    return count;
  }, [filters]);

  // UPDATE: Aplicar los filtros con un pequeño debounce para mejor rendimiento
  useEffect(() => {
    if (filterUpdateTimeout) {
      clearTimeout(filterUpdateTimeout);
    }
    
    // Debounce de 300ms para evitar demasiadas actualizaciones durante cambios rápidos
    const newTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
    
    setFilterUpdateTimeout(newTimeout);
    
    return () => {
      if (filterUpdateTimeout) {
        clearTimeout(filterUpdateTimeout);
      }
    };
  }, [searchTerm, filters, products]);

  // Handle main filter changes
  const handleFilterChange = useCallback((filterName, option) => {
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
  }, [setFilters]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleOnSaleChange = useCallback((e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      oferta: e.target.checked ? 'Sí' : null
    }));
  }, [setFilters]);

  const handleExcessChange = useCallback((e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      excedente: e.target.checked ? 'Sí' : null
    }));
  }, [setFilters]);

  // UPDATE: Improved near expiration change handler
  const handleNearExpirationChange = useCallback((e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      proxima_caducidad: e.target.checked ? 'Sí' : null
    }));
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      temporada: null,
      tipo: null,
      subtipo: null,
      oferta: null,
      calificacion: null,
      excedente: null,
      proxima_caducidad: null,
    });
    setSearchTerm('');
  }, [setFilters]);

  const getAvailableSubtypes = useCallback(() => {
    if (!filters.tipo || !productTypesAndSubtypes[filters.tipo]) {
      return [];
    }
    return productTypesAndSubtypes[filters.tipo];
  }, [filters.tipo, productTypesAndSubtypes]);

  // UPDATE: Improved isNearExpiration function to handle date boundaries better
  const isNearExpiration = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    // Handle different date formats
    let expDate;
    if (typeof expirationDate === 'string') {
      // If it's an ISO string like "2025-03-11T00:00:00.000Z", extract just the date part
      const dateStr = expirationDate.includes('T') ? 
        expirationDate.split('T')[0] : 
        expirationDate;
        
      expDate = new Date(dateStr);
    } else {
      expDate = new Date(expirationDate);
    }
    
    expDate.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  }, []);

  // UPDATE: Simplified applyFilters function by removing date range logic
  const applyFilters = useCallback(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Apply search term if it exists
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => {
        // Check in all text fields if they contain the search term
        return (
          (product.name_product && product.name_product.toLowerCase().includes(searchLower)) ||
          (product.type_product && product.type_product.toLowerCase().includes(searchLower)) ||
          (product.subtype_product && product.subtype_product.toLowerCase().includes(searchLower)) ||
          (product.info_product && product.info_product.toLowerCase().includes(searchLower)) ||
          (product.season_product && product.season_product.toLowerCase().includes(searchLower)) ||
          (product.country_product && product.country_product.toLowerCase().includes(searchLower)) ||
          (product.locality_product && product.locality_product.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply other filters
    if (filters.temporada) {
      filtered = filtered.filter(product => product.season_product === filters.temporada);
    }

    if (filters.tipo) {
      filtered = filtered.filter(product => product.type_product === filters.tipo);
    }

    if (filters.subtipo) {
      filtered = filtered.filter(product => product.subtype_product === filters.subtipo);
    }

    if (filters.calificacion) {
      filtered = filtered.filter(product => 
        product.calification_product >= parseInt(filters.calificacion)
      );
    }

    if (filters.oferta === 'Sí') {
      filtered = filtered.filter(product => 
        product.discount_product > 0
      );
    }

    // Filter for products with surplus
    if (filters.excedente === 'Sí') {
      filtered = filtered.filter(product => 
        product.surplus_product > 0
      );
    }

    // UPDATE: Improved filter for products near expiration
    if (filters.proxima_caducidad === 'Sí') {
      filtered = filtered.filter(product => 
        product.expiration_product && isNearExpiration(product.expiration_product)
      );
    }

    setFilteredProducts(filtered);
  }, [filters, products, searchTerm, isNearExpiration, setFilteredProducts]);

  return {
    isVisible,
    searchTerm,
    handleFilterChange,
    handleSearchChange,
    handleOnSaleChange,
    handleExcessChange,
    handleNearExpirationChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount
  };
};

export default FiltersForProductsFunctions;