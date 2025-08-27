// src/components/landing_page/LandingPageUtils.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSpring, config } from '@react-spring/web';

//update: Enhanced portrait slideshow management hook with 8 portraits
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

//update: Enhanced scroll detection with parallax support
export const useParallaxScroll = (threshold = 50) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);
  
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
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setScrollY(currentScrollY);
      
      // Calculate overall scroll progress
      const progress = Math.min(currentScrollY / (documentHeight - windowHeight), 1);
      setScrollProgress(progress);
      
      // Show features after initial scroll
      if (currentScrollY > threshold && !hasScrolled) {
        setHasScrolled(true);
        setShowFeatures(true);
      }
      
      // Show enter button after scrolling through features
      if (currentScrollY > windowHeight * 0.8 && !showEnterButton) {
        setShowEnterButton(true);
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
        setShowFeatures(true);
      }
    };
    
    // Mouse wheel for desktop
    const handleWheel = (e) => {
      if (e.deltaY > 0 && !hasScrolled) {
        setHasScrolled(true);
        setShowFeatures(true);
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
  }, [hasScrolled, showEnterButton, threshold, isMobile]);
  
  return {
    hasScrolled,
    scrollProgress,
    scrollY,
    isMobile,
    showFeatures,
    showEnterButton
  };
};

//update: Parallax animation configurations for features
export const useParallaxAnimations = (scrollY, showFeatures) => {
  // Hero section parallax
  const heroParallax = useSpring({
    transform: `translateY(${scrollY * 0.5}px)`,
    opacity: Math.max(1 - (scrollY / 800), 0),
    config: config.slow
  });
  
  // Feature cards with staggered parallax
  const feature1Animation = useSpring({
    opacity: showFeatures ? 1 : 0,
    transform: showFeatures 
      ? `translateY(${-scrollY * 0.3}px) translateX(0px) scale(1)` 
      : `translateY(100px) translateX(-50px) scale(0.9)`,
    config: config.molasses
  });
  
  const feature2Animation = useSpring({
    opacity: showFeatures ? 1 : 0,
    transform: showFeatures 
      ? `translateY(${-scrollY * 0.2}px) translateX(0px) scale(1)` 
      : `translateY(100px) translateX(50px) scale(0.9)`,
    delay: 200,
    config: config.molasses
  });
  
  const feature3Animation = useSpring({
    opacity: showFeatures ? 1 : 0,
    transform: showFeatures 
      ? `translateY(${-scrollY * 0.25}px) translateX(0px) scale(1)` 
      : `translateY(100px) translateX(-50px) scale(0.9)`,
    delay: 400,
    config: config.molasses
  });
  
  return {
    heroParallax,
    feature1Animation,
    feature2Animation,
    feature3Animation
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

//update: Enhanced button animation hook
export const useEnterButtonAnimation = (show) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const buttonAnimation = useSpring({
    opacity: show ? 1 : 0,
    transform: show 
      ? `translateY(0px) scale(${isPressed ? 0.95 : isHovered ? 1.05 : 1})` 
      : 'translateY(50px) scale(0.8)',
    boxShadow: isHovered 
      ? '0 20px 40px rgba(151, 71, 255, 0.4)' 
      : '0 10px 20px rgba(151, 71, 255, 0.2)',
    config: config.wobbly
  });
  
  const glowAnimation = useSpring({
    opacity: isHovered ? 1 : 0,
    transform: `scale(${isHovered ? 1.2 : 1})`,
    config: config.gentle
  });
  
  return {
    buttonAnimation,
    glowAnimation,
    isHovered,
    setIsHovered,
    isPressed,
    setIsPressed
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

//update: Intersection Observer for feature cards
export const useIntersectionObserver = (options = {}) => {
  const [entries, setEntries] = useState({});
  const [elements, setElements] = useState([]);
  
  useEffect(() => {
    if (elements.length === 0) return;
    
    const observer = new IntersectionObserver((observerEntries) => {
      const newEntries = {};
      observerEntries.forEach((entry) => {
        newEntries[entry.target.id] = entry;
      });
      setEntries((prev) => ({ ...prev, ...newEntries }));
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px',
      ...options
    });
    
    elements.forEach((element) => {
      if (element) observer.observe(element);
    });
    
    return () => {
      elements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [elements, options.threshold, options.rootMargin]);
  
  const observe = useCallback((element) => {
    if (element && !elements.includes(element)) {
      setElements((prev) => [...prev, element]);
    }
  }, [elements]);
  
  return { entries, observe };
};