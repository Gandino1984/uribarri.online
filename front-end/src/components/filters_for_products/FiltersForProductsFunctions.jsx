import { useState, useEffect, useContext } from 'react';
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
  const [expirationDateRange, setExpirationDateRange] = useState({ start: '', end: '' });

  // Set visibility after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle search term changes and filter products
  useEffect(() => {
    // Apply all filters including search term
    applyFilters();
  }, [searchTerm, filters, products, expirationDateRange]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOnSaleChange = (e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      oferta: e.target.checked ? 'Sí' : null
    }));
  };

  const handleExcessChange = (e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      excedente: e.target.checked ? 'Sí' : null
    }));
  };

  const handleExpirationChange = (e) => {
    const { name, value } = e.target;
    setExpirationDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNearExpirationChange = (e) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      proxima_caducidad: e.target.checked ? 'Sí' : null
    }));
  };

  const handleResetFilters = () => {
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
    setExpirationDateRange({ start: '', end: '' });
  };

  const getAvailableSubtypes = () => {
    if (!filters.tipo || !productTypesAndSubtypes[filters.tipo]) {
      return [];
    }
    return productTypesAndSubtypes[filters.tipo];
  };

  // Check if a product is near expiration (within 7 days)
  const isNearExpiration = (expirationDate) => {
    if (!expirationDate) return false;
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  // Function to apply all filters including search term
  const applyFilters = () => {
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

    // Filter for products near expiration
    if (filters.proxima_caducidad === 'Sí') {
      filtered = filtered.filter(product => 
        product.expiration_product && isNearExpiration(product.expiration_product)
      );
    }

    // Filter by expiration date range
    if (expirationDateRange.start || expirationDateRange.end) {
      filtered = filtered.filter(product => {
        if (!product.expiration_product) return false;
        
        const expDate = new Date(product.expiration_product);
        
        if (expirationDateRange.start && expirationDateRange.end) {
          const startDate = new Date(expirationDateRange.start);
          const endDate = new Date(expirationDateRange.end);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return expDate >= startDate && expDate <= endDate;
        } else if (expirationDateRange.start) {
          const startDate = new Date(expirationDateRange.start);
          startDate.setHours(0, 0, 0, 0);
          return expDate >= startDate;
        } else if (expirationDateRange.end) {
          const endDate = new Date(expirationDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          return expDate <= endDate;
        }
        
        return true;
      });
    }

    setFilteredProducts(filtered);
  };

  return {
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
  };
};

export default FiltersForProductsFunctions;