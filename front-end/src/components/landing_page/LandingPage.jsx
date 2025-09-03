// src/components/landing_page/LandingPage.jsx
import { useRef, useState, useEffect } from 'react';
import { animated, useSpring, useTransition, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import styles from '../../../../public/css/LandingPage.module.css';
//update: Import Lucide icons for polished scroll indicators
import { Mouse, MoveDown, ChevronDown, Hand } from 'lucide-react';

const LandingPage = () => {
  //update: Navigation context and user authentication
  const { setShowTopBar, setShowLandingPage, setShowShopWindow, setShowShopsListBySeller } = useUI();
  const { currentUser } = useAuth();
  
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  
  //update: State management for slideshow and interactions
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  //update: Add button hover and press states
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  //update: Add device type detection state
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  //update: Extended portrait images array - 8 portraits total
  const portraits = [
    '/images/portraits/user1.png',
    '/images/portraits/user2.png', 
    '/images/portraits/user3.png',
    '/images/portraits/user4.png',
    '/images/portraits/user5.png',
    '/images/portraits/user6.png',
    '/images/portraits/user7.png',
    '/images/portraits/user8.png'
  ];
  
  //update: Device detection for scroll icon
  useEffect(() => {
    const checkDevice = () => {
      // Check if it's a touch device or small screen
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobileDevice(isTouchDevice || isSmallScreen);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  //update: Random interval for portrait transitions (4-6 seconds)
  const getRandomInterval = () => 4000 + Math.random() * 2000;
  
  //update: Auto-advance slideshow with random intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % portraits.length);
    }, getRandomInterval());
    
    return () => clearInterval(interval);
  }, [currentImageIndex, portraits.length]);
  
  //update: Scroll detection for button reveal - fixed for mouse wheel
  useEffect(() => {
    let scrollAccumulator = 0;
    
    const handleWheel = (e) => {
      e.preventDefault();
      scrollAccumulator += e.deltaY;
      
      if (scrollAccumulator > 100 && !hasScrolled) {
        setHasScrolled(true);
        setShowButton(true);
      }
    };
    
    const handleScroll = () => {
      if (window.scrollY > 10 && !hasScrolled) {
        setHasScrolled(true);
        setShowButton(true);
      }
    };
    
    // Touch events for mobile
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchDelta = touchStartY - e.touches[0].clientY;
      if (touchDelta > 50 && !hasScrolled) {
        setHasScrolled(true);
        setShowButton(true);
      }
    };
    
    // Add passive: false to allow preventDefault on wheel
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [hasScrolled]);
  
  //update: Portrait fade transitions with faster, smoother effect
  const transitions = useTransition(currentImageIndex, {
    from: { 
      opacity: 0,
      transform: 'scale(1.02) translateZ(0)',
    },
    enter: { 
      opacity: 1,
      transform: 'scale(1) translateZ(0)',
    },
    leave: { 
      opacity: 0,
      transform: 'scale(0.98) translateZ(0)',
    },
    config: {
      duration: 1500 // 1.5 second transition
    },
    exitBeforeEnter: false // Allow overlap for smoother transition
  });
  
  //update: Enhanced button animation with hover and press effects
  const buttonSpring = useSpring({
    opacity: showButton ? 1 : 0,
    transform: showButton 
      ? `translateY(0px) scale(${isButtonPressed ? 0.95 : isButtonHovered ? 1.05 : 1})` 
      : 'translateY(50px) scale(0.8)',
    config: config.gentle
  });
  
  //update: Button glow effect animation
  const buttonGlowSpring = useSpring({
    boxShadow: isButtonHovered 
      ? '0 0 30px rgba(151, 71, 255, 0.6), 0 0 60px rgba(151, 71, 255, 0.3), inset 0 0 20px rgba(151, 71, 255, 0.2)'
      : '0 0 15px rgba(151, 71, 255, 0.4), 0 0 30px rgba(151, 71, 255, 0.2)',
    background: isButtonHovered
      ? 'linear-gradient(135deg, rgba(151, 71, 255, 0.9) 0%, rgba(120, 50, 220, 0.9) 100%)'
      : 'linear-gradient(135deg, rgba(151, 71, 255, 0.8) 0%, rgba(120, 50, 220, 0.8) 100%)',
    config: config.gentle
  });
  
  //update: Button text animationgentle
  const buttonTextSpring = useSpring({
    letterSpacing: isButtonHovered ? '0.3rem' : '0.2rem',
    transform: isButtonHovered ? 'scale(1.1)' : 'scale(1)',
    config: config.gentle
  });
  
  //update: Overlay gradient animation
  const overlaySpring = useSpring({
    opacity: showButton ? 0.7 : 0.4,
    config: config.slow
  });
  
  //update: Exit animation for page transition
  const exitSpring = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'scale(1.05)' : 'scale(1)',
    filter: isExiting ? 'brightness(0)' : 'brightness(1)',
    config: config.slow
  });
  
  //update: Text animations
  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 500,
    config: config.molasses
  });
  
  const subtitleSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1},
    delay: 800,
    config: config.molasses
  });
  
  //update: Scroll hint animation
  const scrollHintSpring = useSpring({
    opacity: !showButton ? 1 : 0,
    transform: !showButton 
      ? 'translateY(0px)' 
      : 'translateY(-20px)',
    config: config.wobbly
  });
  
  //update: Handle button click and navigation
  const handleButtonClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    
    setTimeout(() => {
      setShowTopBar(true);
      setShowLandingPage(false);
      
      if (currentUser && currentUser.type_user === 'seller') {
        setShowShopsListBySeller(true);
        setShowShopWindow(false);
      } else {
        setShowShopWindow(true);
        setShowShopsListBySeller(false);
      }
    }, 800);
  };
  
  return (
    <animated.div 
      ref={containerRef}
      style={exitSpring}
      className={styles.container}
    >
      {/* Portrait slideshow background */}
      <div className={styles.portraitContainer}>
        {transitions((style, item) => (
          item !== null && (
            <animated.div
              className={styles.portraitImage}
              style={{
                ...style,
                backgroundImage: `url(${portraits[item]})`,
              }}
            />
          )
        ))}
      </div>
      
      {/* Gradient overlay */}
      <animated.div 
        className={styles.overlay}
        style={overlaySpring}
      />
      
      {/* Hero content */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <animated.p style={subtitleSpring}>
            Participa y transforma tu barrio.
          </animated.p>
          <animated.h1 style={titleSpring}>
            mibarrio.online
          </animated.h1>
        </div>
        
        {/* update: Polished scroll hint with Lucide icons */}
        <animated.div 
          className={styles.scrollHint}
          style={scrollHintSpring}
        >
          <span className={styles.scrollText}>Desliza para entrar</span>
          {isMobileDevice ? (
            // Touch gesture indicator for mobile
            <div className={styles.mobileScrollIndicator}>
              <div className={styles.handIconWrapper}>
                <Hand 
                  className={styles.handIcon}
                  size={28}
                  color="rgba(255, 255, 255, 0.7)"
                  strokeWidth={1.5}
                />
                <div className={styles.swipeIndicator}>
                  <MoveDown 
                    className={styles.swipeArrow}
                    size={20}
                    color="#D1FF1F"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div className={styles.pulseDots}>
                <span className={styles.pulseDot}></span>
                <span className={styles.pulseDot}></span>
                <span className={styles.pulseDot}></span>
              </div>
            </div>
          ) : (
            // Mouse scroll indicator for desktop
            <div className={styles.desktopScrollIndicator}>
              <div className={styles.mouseWrapper}>
                <Mouse 
                  className={styles.mouseIcon}
                  size={24}
                  color="rgba(255, 255, 255, 0.6)"
                  strokeWidth={1.5}
                />
                <div className={styles.scrollWheel}></div>
              </div>
              <div className={styles.chevronWrapper}>
                <ChevronDown 
                  className={styles.chevron1}
                  size={16}
                  color="rgba(151, 71, 255, 0.6)"
                  strokeWidth={2}
                />
                <ChevronDown 
                  className={styles.chevron2}
                  size={16}
                  color="#D1FF1F"
                  strokeWidth={2}
                />
                <ChevronDown 
                  className={styles.chevron3}
                  size={16}
                  color="#D1FF1F"
                  strokeWidth={2}
                />
              </div>
            </div>
          )}
        </animated.div>
        
        {/* Custom animated ENTRAR button */}
        <animated.div 
          className={styles.buttonWrapper}
          style={buttonSpring}
        >
          <animated.button
            ref={buttonRef}
            className={styles.enterButton}
            style={buttonGlowSpring}
            onClick={handleButtonClick}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => {
              setIsButtonHovered(false);
              setIsButtonPressed(false);
            }}
            onMouseDown={() => setIsButtonPressed(true)}
            onMouseUp={() => setIsButtonPressed(false)}
            onTouchStart={() => setIsButtonPressed(true)}
            onTouchEnd={() => {
              setIsButtonPressed(false);
              setIsButtonHovered(false);
            }}
            disabled={isExiting}
            aria-label="Entrar al Escaparate"
          >
            <animated.span 
              className={styles.buttonText}
              style={buttonTextSpring}
            >
              ENTRAR
            </animated.span>
            <div className={styles.buttonShine} />
          </animated.button>
        </animated.div>
      </div>
    </animated.div>
  );
};

export default LandingPage;