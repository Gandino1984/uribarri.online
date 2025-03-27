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
    maxHeight: '6rem', // 🔄 UPDATE: Reduced from 8rem to 4.5rem for more subtle expansion
    padding: '0.3rem 1.5rem', // 🔄 UPDATE: Reduced padding difference for smoother transition
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