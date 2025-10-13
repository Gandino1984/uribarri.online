//update: LandingPage.jsx - Using public folder for portrait images
import { useRef, useState, useEffect } from 'react';
import { animated, useSpring, useTransition, config } from '@react-spring/web';
import { useUI } from '../../app_context/UIContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import styles from '../../../public/css/LandingPage.module.css';
import { Mouse, MoveDown, ChevronDown, Hand, ShoppingBag, Newspaper, Bot } from 'lucide-react';

const LandingPage = () => {
  const { 
    setShowTopBar, 
    setShowLandingPage, 
    setShowShopWindow, 
    setShowShopsListBySeller,
    setShowInfoManagement,
    setNavigationIntent,
    openModal
  } = useUI();
  const { currentUser, setIsLoggingIn } = useAuth();
  
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitingTo, setExitingTo] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isShopButtonHovered, setIsShopButtonHovered] = useState(false);
  const [isShopButtonPressed, setIsShopButtonPressed] = useState(false);
  const [isInfoButtonHovered, setIsInfoButtonHovered] = useState(false);
  const [isInfoButtonPressed, setIsInfoButtonPressed] = useState(false);
  const [isIAButtonHovered, setIsIAButtonHovered] = useState(false);
  const [isIAButtonPressed, setIsIAButtonPressed] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  //update: Use public folder URLs instead of imports
  const portraits = [
    '/images/portraits/user1.png',
    '/images/portraits/user2.png',
    '/images/portraits/user3.png',
    '/images/portraits/user4.png',
    '/images/portraits/user5.png',
    // '/images/portraits/user6.png',
    '/images/portraits/user7.png',
    '/images/portraits/user8.png',
    '/images/portraits/user9.png',
  ];
  
  // Rest of component remains exactly the same...
  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobileDevice(isTouchDevice || isSmallScreen);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  const getRandomInterval = () => 4000 + Math.random() * 2000;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % portraits.length);
    }, getRandomInterval());
    
    return () => clearInterval(interval);
  }, [currentImageIndex, portraits.length]);
  
  useEffect(() => {
    let scrollAccumulator = 0;
    
    const handleWheel = (e) => {
      e.preventDefault();
      scrollAccumulator += e.deltaY;
      
      if (scrollAccumulator > 100 && !hasScrolled) {
        setHasScrolled(true);
        setShowButtons(true);
      }
    };
    
    const handleScroll = () => {
      if (window.scrollY > 10 && !hasScrolled) {
        setHasScrolled(true);
        setShowButtons(true);
      }
    };
    
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const touchDelta = touchStartY - e.touches[0].clientY;
      if (touchDelta > 50 && !hasScrolled) {
        setHasScrolled(true);
        setShowButtons(true);
      }
    };
    
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
  
  const transitions = useTransition(portraits[currentImageIndex], {
    key: currentImageIndex,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 1500 }
  });
  
  const buttonsContainerSpring = useSpring({
    opacity: showButtons ? 1 : 0,
    transform: showButtons ? 'translateY(0px)' : 'translateY(50px)',
    config: config.gentle
  });
  
  const shopButtonSpring = useSpring({
    transform: `scale(${isShopButtonPressed ? 0.95 : isShopButtonHovered ? 1.05 : 1})`,
    config: config.gentle
  });
  
  const infoButtonSpring = useSpring({
    transform: `scale(${isInfoButtonPressed ? 0.95 : isInfoButtonHovered ? 1.05 : 1})`,
    config: config.gentle
  });
  
  const iaButtonSpring = useSpring({
    transform: `scale(${isIAButtonPressed ? 0.95 : isIAButtonHovered ? 1.05 : 1})`,
    config: config.gentle
  });
  
  const shopButtonGlowSpring = useSpring({
    boxShadow: isShopButtonHovered 
      ? '0 0 30px rgba(151, 71, 255, 0.6), 0 0 60px rgba(151, 71, 255, 0.3), inset 0 0 20px rgba(151, 71, 255, 0.2)'
      : '0 0 15px rgba(151, 71, 255, 0.4), 0 0 30px rgba(151, 71, 255, 0.2)',
    background: isShopButtonHovered
      ? 'linear-gradient(135deg, rgba(151, 71, 255, 0.9) 0%, rgba(120, 50, 220, 0.9) 100%)'
      : 'linear-gradient(135deg, rgba(151, 71, 255, 0.8) 0%, rgba(120, 50, 220, 0.8) 100%)',
    config: config.gentle
  });
  
  const infoButtonGlowSpring = useSpring({
    boxShadow: isInfoButtonHovered 
      ? '0 0 30px rgba(209, 255, 31, 0.6), 0 0 60px rgba(209, 255, 31, 0.3), inset 0 0 20px rgba(209, 255, 31, 0.2)'
      : '0 0 15px rgba(209, 255, 31, 0.4), 0 0 30px rgba(209, 255, 31, 0.2)',
    background: isInfoButtonHovered
      ? 'linear-gradient(135deg, rgba(209, 255, 31, 0.9) 0%, rgba(180, 220, 20, 0.9) 100%)'
      : 'linear-gradient(135deg, rgba(209, 255, 31, 0.8) 0%, rgba(180, 220, 20, 0.8) 100%)',
    config: config.gentle
  });
  
  const iaButtonGlowSpring = useSpring({
    boxShadow: isIAButtonHovered 
      ? '0 0 30px rgba(255, 149, 0, 0.6), 0 0 60px rgba(255, 149, 0, 0.3), inset 0 0 20px rgba(255, 149, 0, 0.2)'
      : '0 0 15px rgba(255, 149, 0, 0.4), 0 0 30px rgba(255, 149, 0, 0.2)',
    background: isIAButtonHovered
      ? 'linear-gradient(135deg, rgba(255, 149, 0, 0.9) 0%, rgba(255, 120, 0, 0.9) 100%)'
      : 'linear-gradient(135deg, rgba(255, 149, 0, 0.8) 0%, rgba(255, 120, 0, 0.8) 100%)',
    config: config.gentle
  });
  
  const overlaySpring = useSpring({
    opacity: showButtons ? 0.7 : 0.4,
    config: config.slow
  });
  
  const exitSpring = useSpring({
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'scale(1.05)' : 'scale(1)',
    filter: isExiting ? 'brightness(0)' : 'brightness(1)',
    config: config.slow
  });
  
  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(-150px)' },
    delay: 500,
    config: config.gentle
  });
  
  const subtitleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(-150px)'},
    delay: 800,
    config: config.gentle
  });
  
  const scrollHintSpring = useSpring({
    opacity: !showButtons ? 1 : 0,
    transform: !showButtons 
      ? 'translateY(0px)' 
      : 'translateY(-20px)',
    config: config.wobbly
  });
  
  const handleShopButtonClick = () => {
    if (isExiting) return;
    
    setIsExiting(true);
    setExitingTo('shop');
    
    setTimeout(() => {
      setShowTopBar(true);
      setShowLandingPage(false);
      
      if (currentUser) {
        if (currentUser.type_user === 'seller') {
          setShowShopsListBySeller(true);
          setShowShopWindow(false);
          setShowInfoManagement(false);
        } else if (currentUser.type_user === 'rider') {
          setShowShopWindow(true);
          setShowShopsListBySeller(false);
          setShowInfoManagement(false);
        } else {
          setShowShopWindow(true);
          setShowShopsListBySeller(false);
          setShowInfoManagement(false);
        }
      } else {
        console.log('Anonymous user accessing ShopWindow');
        setShowShopWindow(true);
        setShowShopsListBySeller(false);
        setShowInfoManagement(false);
      }
    }, 800);
  };
  
  const handleInfoButtonClick = () => {
    if (isExiting) return;
    
    setIsExiting(true);
    setExitingTo('info');
    
    setTimeout(() => {
      setShowTopBar(true);
      setShowLandingPage(false);
      
      console.log('User accessing InfoManagement (public access)');
      setShowInfoManagement(true);
      setShowShopWindow(false);
      setShowShopsListBySeller(false);
    }, 800);
  };
  
  const handleIAButtonClick = () => {
    if (isExiting) return;
    
    openModal(
      'Estás a punto de salir de uribarri.online y ser redirigido a zuriai.org, un sitio web externo.',
      (confirmed) => {
        if (confirmed) {
          window.open('https://zuriai.org/', '_blank', 'noopener,noreferrer');
        }
      }
    );
  };
  
  return (
    <animated.div 
      ref={containerRef}
      style={exitSpring}
      className={styles.container}
    >
      <div className={styles.portraitContainer}>
        {transitions((style, item) => (
          item && (
            <animated.div
              className={styles.portraitImage}
              style={{
                ...style,
                backgroundImage: `url(${item})`,
              }}
            />
          )
        ))}
      </div>
      
      <animated.div 
        className={styles.overlay}
        style={overlaySpring}
      />
      
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <animated.p style={subtitleSpring}>
            Participa y transforma tu barrio
          </animated.p>
          <animated.h1 style={titleSpring}>
            uribarri.online
          </animated.h1>
        </div>
        
        <animated.div 
          className={styles.scrollHint}
          style={scrollHintSpring}
        >
          <span className={styles.scrollText}>Desliza para continuar</span>
          {isMobileDevice ? (
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
        
        <animated.div 
          className={styles.buttonsContainer}
          style={buttonsContainerSpring}
        >
          <animated.div 
            className={styles.buttonWrapper}
            style={shopButtonSpring}
          >
            <animated.button
              className={styles.enterButton}
              style={shopButtonGlowSpring}
              onClick={handleShopButtonClick}
              onMouseEnter={() => setIsShopButtonHovered(true)}
              onMouseLeave={() => {
                setIsShopButtonHovered(false);
                setIsShopButtonPressed(false);
              }}
              onMouseDown={() => setIsShopButtonPressed(true)}
              onMouseUp={() => setIsShopButtonPressed(false)}
              onTouchStart={() => setIsShopButtonPressed(true)}
              onTouchEnd={() => {
                setIsShopButtonPressed(false);
                setIsShopButtonHovered(false);
              }}
              disabled={isExiting}
              aria-label="Ir al Escaparate Comercial"
            >
              <ShoppingBag className={styles.buttonIcon} size={20} />
              <span className={styles.buttonText}>
                Escaparate comercial
              </span>
              <div className={styles.buttonShine} />
            </animated.button>
          </animated.div>
          
          <animated.div 
            className={styles.buttonWrapper}
            style={infoButtonSpring}
          >
            <animated.button
              className={`${styles.enterButton} ${styles.infoButton}`}
              style={infoButtonGlowSpring}
              onClick={handleInfoButtonClick}
              onMouseEnter={() => setIsInfoButtonHovered(true)}
              onMouseLeave={() => {
                setIsInfoButtonHovered(false);
                setIsInfoButtonPressed(false);
              }}
              onMouseDown={() => setIsInfoButtonPressed(true)}
              onMouseUp={() => setIsInfoButtonPressed(false)}
              onTouchStart={() => setIsInfoButtonPressed(true)}
              onTouchEnd={() => {
                setIsInfoButtonPressed(false);
                setIsInfoButtonHovered(false);
              }}
              disabled={isExiting}
              aria-label="Ir al Tablón Informativo"
            >
              <Newspaper className={styles.buttonIcon} size={20} />
              <span className={styles.buttonText}>
                Tablón informativo
              </span>
              <div className={styles.buttonShine} />
            </animated.button>
          </animated.div>
          
          <animated.div 
            className={styles.buttonWrapper}
            style={iaButtonSpring}
          >
            <animated.button
              className={`${styles.enterButton} ${styles.iaButton}`}
              style={iaButtonGlowSpring}
              onClick={handleIAButtonClick}
              onMouseEnter={() => setIsIAButtonHovered(true)}
              onMouseLeave={() => {
                setIsIAButtonHovered(false);
                setIsIAButtonPressed(false);
              }}
              onMouseDown={() => setIsIAButtonPressed(true)}
              onMouseUp={() => setIsIAButtonPressed(false)}
              onTouchStart={() => setIsIAButtonPressed(true)}
              onTouchEnd={() => {
                setIsIAButtonPressed(false);
                setIsIAButtonHovered(false);
              }}
              disabled={isExiting}
              aria-label="Ir a IA Antirumor"
            >
              <Bot className={styles.buttonIcon} size={20} />
              <span className={styles.buttonText}>
                IA antirumor
              </span>
              <div className={styles.buttonShine} />
            </animated.button>
          </animated.div>
        </animated.div>
      </div>
    </animated.div>
  );
};

export default LandingPage;