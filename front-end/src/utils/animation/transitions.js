// animations/transitions.js
import { config } from '@react-spring/web';

export const fadeInScale = {
  from: { 
    opacity: 0,
    transform: 'scale(0.9) translateY(20px)',
  },
  enter: { 
    opacity: 1,
    transform: 'scale(1) translateY(0px)',
  },
  leave: { 
    opacity: 0,
    transform: 'scale(0.9) translateY(20px)',
  },
  config: {
    mass: 1,
    tension: 280,
    friction: 20,
  },
};

export const fadeIn = {
  from: { opacity: 0 },
  enter: { opacity: 1 },
  leave: { opacity: 0 },
  config: config.gentle,
};

export const slideIn = {
  from: { transform: 'translateX(-100%)' },
  enter: { transform: 'translateX(0)' },
  leave: { transform: 'translateX(100%)' },
  config: config.gentle,
};

export const popIn = {
  from: { 
    opacity: 0,
    transform: 'scale(0.8)',
  },
  enter: { 
    opacity: 1,
    transform: 'scale(1)',
  },
  leave: { 
    opacity: 0,
    transform: 'scale(0.8)',
  },
  config: config.wobbly,
};

export const topBarAnimation = {
  collapsed: { 
    maxHeight: '2.8rem',
    padding: '0.2rem 1.5rem',
    opacity: 0.95
  },
  expanded: { 
    maxHeight: '6rem',
    padding: '0.3rem 1.5rem',
    opacity: 1
  },
  config: {
    mass: 1,
    tension: 220,
    friction: 26,
  },
};

// Further reduced scale value for collapsed state
export const userInfoCardAnimation = {
  collapsed: {
    transform: 'scale(0.6)',
  },
  expanded: {
    transform: 'scale(1)',
  },
  config: {
    mass: 1,
    tension: 220,
    friction: 26,
  },
};

// 🔄 UPDATE: Add UserInfoCard minimize/maximize animation
export const userInfoCardMinimizeAnimation = {
  minimized: {
    width: '3.5rem',
    paddingRight: '0.5rem',
    paddingLeft: '0.8rem',
  },
  expanded: {
    width: 'auto',
    paddingRight: '0.8rem',
    paddingLeft: '1.8rem',
  },
  config: {
    mass: 1,
    tension: 280,
    friction: 26,
  },
  // Mobile config
  mobileConfig: {
    minimized: {
      width: '3.2rem',
      paddingRight: '0.4rem',
      paddingLeft: '0.6rem',
    },
    expanded: {
      width: 'auto',
      paddingRight: '0.6rem',
      paddingLeft: '1.4rem',
    }
  }
};

// ⚡ UPDATE: Significantly faster form animation
export const formAnimation = {
  from: { 
    opacity: 0,
    transform: 'translateY(30px) scale(0.95)',
    zIndex: -1, // Start with lower z-index
  },
  enter: { 
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    zIndex: 100, // Match the container's z-index
  },
  leave: { 
    opacity: 0,
    transform: 'translateY(-30px) scale(0.95)',
    zIndex: -1, // End with lower z-index
  },
  config: {
    mass: 1,
    tension: 320, // Higher tension for faster animation
    friction: 20,  // Lower friction for faster animation
    clamp: false,
    duration: 200  // Reduced from 350ms to 200ms
  },
};

// For backward compatibility
export const loginFormAnimation = formAnimation;
export const shopFormAnimation = formAnimation;

// ⚡⚡ FIXED: Significantly faster login form animations to fix the slow fade-in
export const loginRegisterFormAnimations = {
  // Form component transition with absolute positioning
  formTransition: {
    from: {
      opacity: 0,
      transform: 'translateY(30px) scale(0.95)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    enter: {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    leave: {
      opacity: 0,
      transform: 'translateY(-30px) scale(0.95)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    config: {
      mass: 1,
      tension: 450, // Even higher tension for instant animation
      friction: 15,  // Lower friction for faster animation
      duration: 100  // Ultra-short duration
    }
  },
  
  // Background gradient animation - MUCH faster
  gradientAnimation: {
    from: { 
      backgroundPosition: '0% 50%',
      opacity: 0 // Start invisible
    },
    to: { 
      backgroundPosition: '100% 50%',
      opacity: 1 // Fade in
    },
    config: { 
      duration: 500, // Long duration for gradient movement
      opacity: { 
        duration: 50 // Ultra-fast fade-in (was 200)
      } 
    },
    loop: { reverse: true },
    delay: 0 // No delay - immediate visibility
  }
};

// 🚀 UPDATE: Animations for ShopsListBySeller component
export const shopsListAnimations = {
  // Title animation with smooth fade effect
  titleAnimation: {
    from: { 
      opacity: 0,
      transform: 'translateY(-20px)',
    },
    enter: { 
      opacity: 1,
      transform: 'translateY(0px)',
    },
    leave: { 
      opacity: 0,
      transform: 'translateY(-20px)',
    },
    config: {
      tension: 280,
      friction: 60,
    },
  },
  
  // Table animation with vertical slide effect
  tableAnimation: {
    from: { 
      opacity: 0,
      transform: 'translateY(50px)',
    },
    enter: { 
      opacity: 1,
      transform: 'translateY(0px)',
    },
    leave: { 
      opacity: 0,
      transform: 'translateY(50px)',
    },
    config: {
      tension: 280,
      friction: 60,
    },
  },
  
  // Shop card animation with fade and slight bounce
  shopCardAnimation: {
    from: { 
      opacity: 0,
      transform: 'translateY(30px)', 
    },
    enter: { 
      opacity: 1,
      transform: 'translateY(0px)',
    },
    leave: { 
      opacity: 0,
      transform: 'translateY(30px)',
    },
    config: {
      tension: 230,
      friction: 22,
    },
  }
};

// 🔄 UPDATE: Refactored LandingPage animations - only configuration, no functions
export const landingPageAnimations = {
  // Container background animation states
  containerAnimation: {
    default: { 
      backgroundColor: 'rgb(0, 0, 0)',  // Default black
      zIndex: 500,                      // Higher than LoginRegisterForm initially
    },
    hover: { 
      backgroundColor: 'rgb(40, 10, 60)',  // Purple on hover
      zIndex: 500,
    },
    exit: { 
      backgroundColor: 'rgb(150, 0, 60)',  // Darker pinkish-red for exit animation
      zIndex: 500,
      opacity: 1,                          // Keep visible during exit
    },
    config: { 
      tension: 140, 
      friction: 12,
      duration: 150  // Fast transition
    },
    opacityConfig: {
      duration: 150  // Ultra-fast fade-out
    }
  },
  
  // Button animation configuration
  buttonAnimation: {
    default: {
      opacity: 1
    },
    exit: {
      opacity: 0,
      transform: 'translateY(-100px) scale(0.1) rotate(720deg)',
    },
    floating: {
      y: { range: [-15, 15], duration: 3000 }, // -15px to 15px over 3 seconds
    },
    config: {
      tension: 170,   // Higher tension for faster animation
      friction: 10,   // Lower friction for faster animation
      mass: 1,        // Lower mass for faster response
      duration: 120   // Even shorter duration
    },
    floatingConfig: {
      tension: 40,    // Low tension for slow movement
      friction: 15,   // Higher friction for water resistance
      mass: 2         // Higher mass for more inertia
    }
  },
  
  // Text content animation configuration
  textAnimation: {
    config: { 
      tension: 340, 
      friction: 24,
      duration: 120
    }
  },
  
  // Page exit animation configuration
  pageExitAnimation: {
    from: { 
      opacity: 1,
      transform: 'scale(1)',
    },
    to: { 
      opacity: 0,
      transform: 'scale(1.05)',
    },
    config: {
      tension: 200,
      friction: 16,  
      duration: 120, 
    }
  },
  
  // Background color animation configuration
  backgroundHoverAnimation: {
    default: {
      backgroundColor: 'rgb(0, 0, 0)',
    },
    hover: {
      backgroundColor: 'rgb(40, 10, 60)',
    },
    config: {
      tension: 120,
      friction: 14,
      duration: 300
    }
  }
};

// ⚡ UPDATE: Ultra-fast page transition
export const pageTransition = {
  config: {
    mass: 1,
    tension: 350, // Higher tension
    friction: 22, // Lower friction
    duration: 50, // Very fast
  },
  from: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
  },
  leave: {
    opacity: 0,
  },
};


export const cardAnimation = {
  from: { 
    opacity: 0,
    transform: 'translateX(100%)', // Start from right
  },
  enter: { 
    opacity: 1,
    transform: 'translateX(0%)',  // Enter to center
  },
  leave: { 
    opacity: 0,
    transform: 'translateX(100%)', // Exit to right
  },
  config: {
    mass: 0.6,
    tension: 300,
    friction: 22,
  },
};