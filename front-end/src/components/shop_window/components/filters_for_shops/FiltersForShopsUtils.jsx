import { useState, useEffect, useCallback, useRef } from 'react';

const useFiltersForShops = (shops = [], shopTypesAndSubtypes = {}) => {
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const filterUpdateTimeoutRef = useRef(null);
  
  //update: Shop-specific filters
  const [filters, setFilters] = useState({
    tipo_comercio: null,          // Shop type (Artesanía, Alimentación, etc.)
    subtipo_comercio: null,       // Shop subtype
    con_delivery: null,           // Has delivery service
    abierto_ahora: null,          // Currently open
    mejor_valorados: null,        // Rating >= 4
    dia_semana: null,             // Open on specific day
  });

  // Set visibility after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  //update: Check if shop is currently open
  const isShopOpenNow = useCallback((shop) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    // Map day number to shop's open_[day] field
    const dayMap = {
      0: shop.open_sunday,
      1: shop.open_monday,
      2: shop.open_tuesday,
      3: shop.open_wednesday,
      4: shop.open_thursday,
      5: shop.open_friday,
      6: shop.open_saturday
    };
    
    // Check if shop is open today
    if (!dayMap[currentDay]) return false;
    
    // Parse shop hours (format: "HH:MM")
    const parseTime = (timeStr) => {
      if (!timeStr || timeStr === '00:00') return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const morningOpen = parseTime(shop.morning_open);
    const morningClose = parseTime(shop.morning_close);
    const afternoonOpen = parseTime(shop.afternoon_open);
    const afternoonClose = parseTime(shop.afternoon_close);
    
    // Check morning hours
    if (morningOpen && morningClose && morningOpen !== morningClose) {
      if (currentTime >= morningOpen && currentTime <= morningClose) {
        return true;
      }
    }
    
    // Check afternoon hours
    if (afternoonOpen && afternoonClose && afternoonOpen !== afternoonClose) {
      if (currentTime >= afternoonOpen && currentTime <= afternoonClose) {
        return true;
      }
    }
    
    return false;
  }, []);

  //update: Check if shop is open on a specific day
  const isOpenOnDay = useCallback((shop, day) => {
    const dayMap = {
      'Lunes': shop.open_monday,
      'Martes': shop.open_tuesday,
      'Miércoles': shop.open_wednesday,
      'Jueves': shop.open_thursday,
      'Viernes': shop.open_friday,
      'Sábado': shop.open_saturday,
      'Domingo': shop.open_sunday
    };
    
    return dayMap[day] === true || dayMap[day] === 1;
  }, []);

  //update: Count active filters
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    
    Object.entries(filters).forEach(([, value]) => {
      if (value !== null && value !== '' && value !== false) {
        count++;
      }
    });
    
    // Also count search term as an active filter
    if (searchTerm && searchTerm.trim() !== '') {
      count++;
    }
    
    return count;
  }, [filters, searchTerm]);

  //update: Apply filters to shops
  const applyFilters = useCallback(() => {
    console.log('Applying filters to shops:', { shops: shops?.length, filters, searchTerm });
    
    if (!shops || shops.length === 0) {
      setFilteredShops([]);
      return;
    }

    let filtered = [...shops];

    // Apply search term
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(shop => {
        return (
          (shop.name_shop && shop.name_shop.toLowerCase().includes(searchLower)) ||
          (shop.type_shop && shop.type_shop.toLowerCase().includes(searchLower)) ||
          (shop.subtype_shop && shop.subtype_shop.toLowerCase().includes(searchLower)) ||
          (shop.location_shop && shop.location_shop.toLowerCase().includes(searchLower))
        );
      });
      console.log(`After search filter: ${filtered.length} shops`);
    }

    // Filter by shop type
    if (filters.tipo_comercio) {
      filtered = filtered.filter(shop => shop.type_shop === filters.tipo_comercio);
      console.log(`After type filter: ${filtered.length} shops`);
    }

    // Filter by shop subtype
    if (filters.subtipo_comercio) {
      filtered = filtered.filter(shop => shop.subtype_shop === filters.subtipo_comercio);
      console.log(`After subtype filter: ${filtered.length} shops`);
    }

    // Filter by delivery availability
    if (filters.con_delivery === 'Sí') {
      filtered = filtered.filter(shop => shop.has_delivery === true || shop.has_delivery === 1);
      console.log(`After delivery filter: ${filtered.length} shops`);
    }

    // Filter by currently open
    if (filters.abierto_ahora === 'Sí') {
      filtered = filtered.filter(shop => isShopOpenNow(shop));
      console.log(`After open now filter: ${filtered.length} shops`);
    }

    // Filter by rating (4+ stars)
    if (filters.mejor_valorados === 'Sí') {
      filtered = filtered.filter(shop => shop.calification_shop >= 4);
      console.log(`After rating filter: ${filtered.length} shops`);
    }

    // Filter by specific day
    if (filters.dia_semana) {
      filtered = filtered.filter(shop => isOpenOnDay(shop, filters.dia_semana));
      console.log(`After day filter: ${filtered.length} shops`);
    }

    console.log(`Final filtered shops: ${filtered.length}`);
    setFilteredShops(filtered);
    return filtered;
  }, [shops, filters, searchTerm, isShopOpenNow, isOpenOnDay]);

  // Apply filters whenever shops, filters, or searchTerm change
  useEffect(() => {
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }
    
    filterUpdateTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 300);
    
    return () => {
      if (filterUpdateTimeoutRef.current) {
        clearTimeout(filterUpdateTimeoutRef.current);
      }
    };
  }, [searchTerm, filters, shops, applyFilters]);

  //update: Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    console.log(`Filter change: ${filterName} = ${value}`);
    const normalizedValue = value === "" ? null : value;
    
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterName]: normalizedValue,
      };

      // Reset subtype when type changes
      if (filterName === 'tipo_comercio') {
        newFilters.subtipo_comercio = null;
      }

      return newFilters;
    });
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    console.log('Search term changed:', value);
    setSearchTerm(value);
  }, []);

  const handleDeliveryChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    console.log('Delivery filter changed:', value);
    setFilters(prevFilters => ({
      ...prevFilters,
      con_delivery: value
    }));
  }, []);

  const handleOpenNowChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    console.log('Open now filter changed:', value);
    setFilters(prevFilters => ({
      ...prevFilters,
      abierto_ahora: value
    }));
  }, []);

  const handleTopRatedChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    console.log('Top rated filter changed:', value);
    setFilters(prevFilters => ({
      ...prevFilters,
      mejor_valorados: value
    }));
  }, []);

  const handleDayChange = useCallback((value) => {
    console.log('Day filter changed:', value);
    setFilters(prevFilters => ({
      ...prevFilters,
      dia_semana: value || null
    }));
  }, []);

  //update: Reset all filters
  const handleResetFilters = useCallback(() => {
    console.log('Resetting all filters');
    setFilters({
      tipo_comercio: null,
      subtipo_comercio: null,
      con_delivery: null,
      abierto_ahora: null,
      mejor_valorados: null,
      dia_semana: null,
    });
    setSearchTerm('');
  }, []);

  //update: Get available subtypes for selected type
  const getAvailableSubtypes = useCallback(() => {
    if (!filters.tipo_comercio || !shopTypesAndSubtypes[filters.tipo_comercio]) {
      return [];
    }
    return shopTypesAndSubtypes[filters.tipo_comercio];
  }, [filters.tipo_comercio, shopTypesAndSubtypes]);

  return {
    isVisible,
    searchTerm,
    filters,
    filteredShops,
    handleFilterChange,
    handleSearchChange,
    handleDeliveryChange,
    handleOpenNowChange,
    handleTopRatedChange,
    handleDayChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount,
    isShopOpenNow,
    setSearchTerm
  };
};

export default useFiltersForShops;