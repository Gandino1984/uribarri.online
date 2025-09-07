import { useState, useRef, useEffect, useCallback } from 'react';

//update: Filter options configuration
export const filterOptions = [
  { 
    id: 'artesanía',
    label: 'Artesanía',
    type: 'artesanía',
    image: '/images/portraits/recommendedFilters/Artesanía.jpg'
  },
  { 
    id: 'comidaasiática',
    label: 'Comida Asiática',
    type: 'comida asiática',
    image: '/images/portraits/recommendedFilters/ComidaAsiática.jpg'
  },
  { 
    id: 'alimentación',
    label: 'Alimentación',
    type: 'Alimentación',
    image: '/images/portraits/recommendedFilters/Conservas.jpg'
  },
  { 
    id: 'frutasyvegetales',
    label: 'Frutas y Vegetales',
    type: 'frutas y vegetales',
    image: '/images/portraits/recommendedFilters/FrutasyVegetales.jpg'
  },
  { 
    id: 'productosorgánicos',
    label: 'Productos orgánicos',
    type: 'productos orgánicos',
    image: '/images/portraits/recommendedFilters/ProductosOrgánicos.jpg'
  },
  { 
    id: 'comidaturca',
    label: 'Comida Turca',
    type: 'comida turca',
    image: '/images/portraits/recommendedFilters/ComidaTurca.jpg'
  },
  { 
    id: 'comidalatina',
    label: 'Comida Latina',
    type: 'comidalatina',
    image: '/images/portraits/recommendedFilters/ComidaLatina.jpg'
  },
  { 
    id: 'joyería',
    label: 'Joyería',
    type: 'joyería',
    image: '/images/portraits/recommendedFilters/Joyería.jpg'
  },
  { 
    id: 'salud',
    label: 'Salud',
    type: 'salud',
    image: '/images/portraits/recommendedFilters/Salud.jpg'
  }
];

//update: Custom hook for managing recommended filters
const useRecommendedFilters = (onFilterSelect, currentFilter) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  //update: Check scroll availability
  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  //update: Scroll handlers
  const scrollLeftHandler = useCallback(() => {
    if (scrollContainerRef.current) {
      // Scroll by the width of 2 items plus gap
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollRightHandler = useCallback(() => {
    if (scrollContainerRef.current) {
      // Scroll by the width of 2 items plus gap
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  //update: Handle filter selection
  const handleFilterClick = useCallback((filter) => {
    if (currentFilter === filter.type) {
      onFilterSelect(null);
    } else {
      onFilterSelect(filter.type);
    }
  }, [currentFilter, onFilterSelect]);

  //update: Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      scrollContainerRef.current.style.cursor = 'grab';
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  //update: Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [startX, scrollLeft]);

  //update: Monitor scroll position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      
      window.addEventListener('resize', checkScrollButtons);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons]);

  return {
    // State
    hoveredIndex,
    canScrollLeft,
    canScrollRight,
    isDragging,
    scrollContainerRef,
    
    // Methods
    setHoveredIndex,
    checkScrollButtons,
    scrollLeft: scrollLeftHandler,
    scrollRight: scrollRightHandler,
    handleFilterClick,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove
  };
};

export default useRecommendedFilters;