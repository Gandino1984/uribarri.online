// src/components/landing_page/LandingPageUtils.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSpring, config } from '@react-spring/web';

//update: Portrait slideshow management hook
export const usePortraitSlideshow = (portraits, intervalRange = { min: 3000, max: 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Generate random interval within range
  const getRandomInterval = useCallback(() => {
    return intervalRange.min + Math.random() * (intervalRange.max - intervalRange.min);
  }, [intervalRange.min, intervalRange.max]);
  
  // Advance to next portrait
  const nextPortrait = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % portraits.length);
      setIsTransitioning(false);
    }, 300);
  }, [portraits.length]);
  
  // Auto-advance with random intervals
  useEffect(() => {
    const advanceSlideshow = () => {
      nextPortrait();
      // Schedule next transition with new random interval
      timeoutId = setTimeout(advanceSlideshow, getRandomInterval());
    };
    
    let timeoutId = setTimeout(advanceSlideshow, getRandomInterval());
    
    return () => clearTimeout(timeoutId);
  }, [nextPortrait, getRandomInterval]);
  
  return {
    currentIndex,
    isTransitioning,
    nextPortrait
  };
};

//update: Scroll detection and button reveal hook
export const useScrollReveal = (threshold = 50) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    let touchStartY = 0;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / threshold, 1);
      
      setScrollProgress(progress);
      
      if (scrollY > threshold && !hasScrolled) {
        setHasScrolled(true);
      }
    };
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const touchDelta = touchStartY - touchY;
      
      if (touchDelta > 30 && !hasScrolled) {
        setHasScrolled(true);
      }
    };
    
    // Mouse wheel for desktop
    const handleWheel = (e) => {
      if (e.deltaY > 0 && !hasScrolled) {
        setHasScrolled(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    if (isMobile) {
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [hasScrolled, threshold, isMobile]);
  
  return {
    hasScrolled,
    scrollProgress,
    isMobile
  };
};

//update: Page transition animations
export const usePageTransition = () => {
  const [isExiting, setIsExiting] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('idle'); // idle, exiting, complete
  
  const startExit = useCallback(() => {
    setIsExiting(true);
    setTransitionPhase('exiting');
    
    // Complete transition after animation
    setTimeout(() => {
      setTransitionPhase('complete');
    }, 800);
  }, []);
  
  const exitAnimation = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'scale(1.05)' : 'scale(1)',
    filter: isExiting ? 'brightness(0) blur(10px)' : 'brightness(1) blur(0px)',
    config: config.slow
  });
  
  return {
    isExiting,
    transitionPhase,
    startExit,
    exitAnimation
  };
};

//update: Portrait animation configurations
export const portraitAnimationConfig = {
  fade: {
    from: { 
      opacity: 0,
      transform: 'scale(1.1) translateZ(0)',
      filter: 'blur(15px) brightness(0.8)'
    },
    enter: { 
      opacity: 1,
      transform: 'scale(1) translateZ(0)',
      filter: 'blur(0px) brightness(1)'
    },
    leave: { 
      opacity: 0,
      transform: 'scale(0.95) translateZ(0)',
      filter: 'blur(15px) brightness(1.2)'
    },
    config: {
      tension: 20,
      friction: 26,
      mass: 1.5
    }
  },
  
  zoom: {
    from: { 
      opacity: 0,
      transform: 'scale(0.8) translateZ(0) rotateZ(5deg)'
    },
    enter: { 
      opacity: 1,
      transform: 'scale(1) translateZ(0) rotateZ(0deg)'
    },
    leave: { 
      opacity: 0,
      transform: 'scale(1.2) translateZ(0) rotateZ(-5deg)'
    },
    config: config.gentle
  },
  
  slide: {
    from: { 
      opacity: 0,
      transform: 'translateX(100%) scale(0.9)'
    },
    enter: { 
      opacity: 1,
      transform: 'translateX(0%) scale(1)'
    },
    leave: { 
      opacity: 0,
      transform: 'translateX(-100%) scale(0.9)'
    },
    config: config.slow
  }
};

//update: Text animation utilities
export const useTextAnimations = (delay = 0) => {
  const titleAnimation = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(40px) scale(0.9)',
      filter: 'blur(4px)'
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0px) scale(1)',
      filter: 'blur(0px)'
    },
    delay: delay,
    config: config.molasses
  });
  
  const subtitleAnimation = useSpring({
    from: { 
      opacity: 0, 
      letterSpacing: '0rem',
      transform: 'scale(0.8)'
    },
    to: { 
      opacity: 1, 
      letterSpacing: '0.5rem',
      transform: 'scale(1)'
    },
    delay: delay + 300,
    config: config.molasses
  });
  
  return {
    titleAnimation,
    subtitleAnimation
  };
};

//update: Device detection utilities
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasTouch: false,
    orientation: 'portrait'
  });
  
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width <= 640,
        isTablet: width > 640 && width <= 1024,
        isDesktop: width > 1024,
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };
    
    updateDeviceInfo();
    
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
};

//update: Performance optimization hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  
  return prefersReducedMotion;
};