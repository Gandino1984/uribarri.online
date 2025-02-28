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
  }, [searchTerm, filters, products]);

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

  const handleResetFilters = () => {
    setFilters({
      temporada: null,
      tipo: null,
      subtipo: null,
      oferta: null,
      calificacion: null,
    });
    setSearchTerm('');
  };

  const getAvailableSubtypes = () => {
    if (!filters.tipo || !productTypesAndSubtypes[filters.tipo]) {
      return [];
    }
    return productTypesAndSubtypes[filters.tipo];
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

    setFilteredProducts(filtered);
  };

  return {
    isVisible,
    searchTerm,
    handleFilterChange,
    handleSearchChange,
    handleOnSaleChange,
    handleResetFilters,
    getAvailableSubtypes
  };
};

export default FiltersForProductsFunctions;