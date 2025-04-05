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

// ✨ UPDATE: Unified form animation for both LoginRegisterForm and ShopCreationForm
export const formAnimation = {
  from: { 
    opacity: 0,
    transform: 'translateY(30px) scale(0.95)',
  },
  enter: { 
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
  },
  leave: { 
    opacity: 0,
    transform: 'translateY(-30px) scale(0.95)',
  },
  config: {
    mass: 1,
    tension: 240,
    friction: 26,
    clamp: false,
    duration: 350
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