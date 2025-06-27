// src/components/common/OButton.jsx
import React, { useState, forwardRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from './Obutton.module.css';

const OButton = forwardRef(({ 
  onClick, 
  disabled = false,
  text = 'O',
  size = 'default', 
  isExiting = false,
  isFloating = false, 
  customAnimations = {},
  className = '',
  ariaLabel = 'Action Button',
  ...props 
}, ref) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Default animations that can be overridden
  const defaultAnimations = {
    floating: {
      from: { transform: 'translateY(0px)' },
      to: async (next) => {
        // Only run the floating animation when not exiting and isFloating is true
        if (isExiting || !isFloating) return;
        
        // Create an infinite loop of floating motion
        while (!isExiting && isFloating) {
          // Float up gently
          await next({ transform: 'translateY(-15px)' });
          // Float down gently
          await next({ transform: 'translateY(0px)' });
        }
      },
      config: { tension: 120, friction: 14 },
      immediate: isExiting || !isFloating,
    },
    exit: {
      opacity: isExiting ? 0 : 1,
      transform: isExiting 
        ? 'translateY(-100px) scale(0.1) rotate(720deg)' 
        : 'translateY(0px) scale(1) rotate(0deg)',
      config: { tension: 270, friction: 20 },
      immediate: !isExiting,
    },
    // 🔄 UPDATE: Default animation when not floating and not exiting
    static: {
      transform: 'translateY(0px)'
    }
  };

  // Merge custom animations with defaults
  const animations = {
    floating: { ...defaultAnimations.floating, ...customAnimations.floating },
    exit: { ...defaultAnimations.exit, ...customAnimations.exit },
    static: { ...defaultAnimations.static, ...customAnimations.static }
  };

  // Apply appropriate animation based on state
  const buttonAnimation = useSpring(
    isExiting ? animations.exit : (isFloating ? animations.floating : animations.static)
  );

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <animated.button 
      ref={ref}
      style={buttonAnimation}
      className={`${styles.oButton} ${styles[size]} ${className}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {text}
    </animated.button>
  );
});

export default OButton;