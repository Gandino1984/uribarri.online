import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useRecommendedFilters, { filterOptions } from './RecommendedFiltersUtils.jsx';
import styles from './../../../../../public/css/RecommendedFilters.module.css';

const RecommendedFilters = ({ onFilterSelect, currentFilter }) => {
  const {
    hoveredIndex,
    canScrollLeft,
    canScrollRight,
    scrollContainerRef,
    setHoveredIndex,
    scrollLeft,
    scrollRight,
    handleFilterClick,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove
  } = useRecommendedFilters(onFilterSelect, currentFilter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.subtitle}>Explora por categorías las actividades comerciales del distrito 02 de Bilbao</p>
      </div>
      
      <div className={styles.sliderWrapper}>
        {/* Left scroll button */}
        <button
          className={`${styles.scrollButton} ${styles.scrollButtonLeft} ${!canScrollLeft ? styles.disabled : ''}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft size={30} />
        </button>

        {/* Slider container with drag functionality */}
        <div 
          className={styles.sliderContainer}
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className={styles.sliderTrack}>
            {filterOptions.map((filter, index) => (
              <button
                key={filter.id}
                className={`${styles.filterButton} ${currentFilter === filter.type ? styles.active : ''}`}
                onClick={() => handleFilterClick(filter)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`Filtrar por ${filter.label}`}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={filter.image}
                    alt={filter.label}
                    className={styles.portrait}
                    loading="lazy"
                    draggable="false"
                  />
                  <div className={styles.imageOverlay} />
                </div>
                
                {/* Label with animation */}
                <div 
                  className={`${styles.labelWrapper} ${hoveredIndex === index ? styles.visible : ''}`}
                >
                  <span className={styles.label}>{filter.label}</span>
                </div>
                
                {/* Active indicator */}
                {currentFilter === filter.type && (
                  <div className={styles.activeIndicator}>
                    <div className={styles.activeDot} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <button
          className={`${styles.scrollButton} ${styles.scrollButtonRight} ${!canScrollRight ? styles.disabled : ''}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* Clear filter button if a filter is active */}
      {currentFilter && (
        <div className={styles.clearFilterWrapper}>
          {/* <button 
            className={styles.clearFilterButton}
            onClick={() => onFilterSelect(null)}
          >
            Limpiar filtro de categoría
          </button> */}
        </div>
      )}
    </div>
  );
};

export default RecommendedFilters;