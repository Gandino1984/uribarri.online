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

// ⚡ UPDATE: LandingPage animations with faster exit
export const landingPageAnimations = {
  // Container background animation (handles background color transition)
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
      backgroundColor: 'rgb(187, 0, 106)',  // Red during exit animation
      zIndex: 500,
      opacity: 1,                          // Keep visible during exit
    },
    config: { 
      tension: 140, 
      friction: 12,
      duration: 200  // Reduced from 600ms to 400ms
    }
  },
  
  // Button animation with enhanced exit coordination
  buttonAnimation: {
    default: {
      opacity: 1
    },
    exit: {
      opacity: 0,
      transform: 'translateY(-500px) scale(0.1) rotate(1080deg)',
    },
    floating: {
      y: { range: [-15, 15], duration: 3000 }, // -15px to 15px over 3 seconds
    },
    config: {
      tension: 45,   // Lower tension for slower acceleration
      friction: 8,   // Very low friction to simulate space/zero-gravity
      mass: 2,       // Higher mass for more inertia
      duration: 200  // Unchanged
    },
    floatingConfig: {
      tension: 40,    // Low tension for slow movement
      friction: 15,   // Higher friction for water resistance
      mass: 2         // Higher mass for more inertia
    }
  },
  
  // Text content animations
  textAnimation: {
    enter: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    exit: {
      opacity: 0,
      transform: 'translateY(-30px)',
    },
    config: { 
      tension: 280, 
      friction: 30 
    }
  },
  
  // ⚡ UPDATE: Faster page exit animation
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
      friction: 18,  
      duration: 100, 
    }
  }
};

// ⚡ UPDATE: Faster gradient animation for the login/register form background
export const gradientAnimation = {
  from: { 
    backgroundPosition: '0% 50%',
    opacity: 0, // Start invisible
  },
  to: { 
    backgroundPosition: '100% 50%',
    opacity: 1, // Fade in
  },
  config: { 
    duration: 300, // Long duration for gradient movement
    opacity: { duration: 100 } // Reduced from 600ms to 300ms for faster fade-in
  },
  loop: { reverse: true }
};

// ⚡ UPDATE: Faster page transition
export const pageTransition = {
  config: {
    mass: 1,
    tension: 350, // Higher tension
    friction: 22, // Lower friction
    duration: 50, // Reduced from 800ms to 350ms
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