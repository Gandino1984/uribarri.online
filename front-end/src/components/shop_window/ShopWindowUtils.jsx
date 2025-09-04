import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/app/axiosConfig.js';

const useShopWindow = (currentUser, shops, setShops, uiHandlers, shopHandlers) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo_comercio: null,
    subtipo_comercio: null,
    con_delivery: null,
    abierto_ahora: null,
    mejor_valorados: null,
    dia_semana: null,
  });

  const fetchAllShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/shop');
      
      if (response.data && !response.data.error) {
        setShops(response.data.data || []);
      } else {
        setError(response.data.error || 'Error al cargar los comercios');
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Error al cargar los comercios');
    } finally {
      setLoading(false);
    }
  }, [setShops]);

  const handleShopClick = useCallback((shop) => {
    const {
      setShowShopWindow,
      setShowLandingPage,
      setSelectedShopForStore,
      setShowShopStore
    } = uiHandlers;

    if (!currentUser) {
      // If user is not logged in, redirect to login/register
      setShowShopWindow(false);
      setShowLandingPage(false);
      // Store the selected shop for after login
      setSelectedShopForStore(shop);
    } else if (currentUser.type_user === 'user') {
      // If user is logged in as 'user', show the shop store
      setSelectedShopForStore(shop);
      setShowShopWindow(false);
      setShowShopStore(true);
    }
    // If user is seller or other type, do nothing on click
  }, [currentUser, uiHandlers]);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((filterName, value) => {
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
    setSearchTerm(e.target.value);
  }, []);

  const handleDeliveryChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    setFilters(prevFilters => ({
      ...prevFilters,
      con_delivery: value
    }));
  }, []);

  const handleOpenNowChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    setFilters(prevFilters => ({
      ...prevFilters,
      abierto_ahora: value
    }));
  }, []);

  const handleTopRatedChange = useCallback((e) => {
    const value = e.target.checked ? 'Sí' : null;
    setFilters(prevFilters => ({
      ...prevFilters,
      mejor_valorados: value
    }));
  }, []);

  const handleDayChange = useCallback((value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      dia_semana: value || null
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
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

  const getAvailableSubtypes = useCallback(() => {
    const { shopTypesAndSubtypes } = shopHandlers;
    if (!filters.tipo_comercio || !shopTypesAndSubtypes[filters.tipo_comercio]) {
      return [];
    }
    return shopTypesAndSubtypes[filters.tipo_comercio];
  }, [filters.tipo_comercio, shopHandlers]);

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

  const getFilteredShops = useCallback(() => {
    if (!shops || shops.length === 0) {
      return [];
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
    }

    // Filter by shop type
    if (filters.tipo_comercio) {
      filtered = filtered.filter(shop => shop.type_shop === filters.tipo_comercio);
    }

    // Filter by shop subtype
    if (filters.subtipo_comercio) {
      filtered = filtered.filter(shop => shop.subtype_shop === filters.subtipo_comercio);
    }

    // Filter by delivery availability
    if (filters.con_delivery === 'Sí') {
      filtered = filtered.filter(shop => shop.has_delivery === true || shop.has_delivery === 1);
    }

    // Filter by currently open
    if (filters.abierto_ahora === 'Sí') {
      filtered = filtered.filter(shop => isShopOpenNow(shop));
    }

    // Filter by rating (4+ stars)
    if (filters.mejor_valorados === 'Sí') {
      filtered = filtered.filter(shop => shop.calification_shop >= 4);
    }

    // Filter by specific day
    if (filters.dia_semana) {
      filtered = filtered.filter(shop => isOpenOnDay(shop, filters.dia_semana));
    }

    return filtered;
  }, [shops, filters, searchTerm, isShopOpenNow, isOpenOnDay]);

  const getDisplayedShops = useCallback(() => {
    const hasActiveFilters = getActiveFiltersCount() > 0;
    return hasActiveFilters || searchTerm ? getFilteredShops() : shops;
  }, [getActiveFiltersCount, searchTerm, getFilteredShops, shops]);

  return {
    // State
    loading,
    error,
    showFilters,
    searchTerm,
    filters,
    
    // Methods
    fetchAllShops,
    handleShopClick,
    toggleFilters,
    handleFilterChange,
    handleSearchChange,
    handleDeliveryChange,
    handleOpenNowChange,
    handleTopRatedChange,
    handleDayChange,
    handleResetFilters,
    getAvailableSubtypes,
    getActiveFiltersCount,
    getDisplayedShops,
    //update: Export setShowFilters so parent can control it
    setShowFilters,
  };
};

export default useShopWindow;