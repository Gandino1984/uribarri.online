import { useState, useEffect } from 'react';

// UPDATE: Created custom hook for screen size detection
const useScreenSize = (breakpoint = 768) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= breakpoint);
    };
    
    // Debounce function to improve performance
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScreenSize, 100);
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for resize events with debounce
    window.addEventListener('resize', debouncedResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [breakpoint]);

  return isSmallScreen;
};

export default useScreenSize;