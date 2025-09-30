import { useState, useRef, useEffect } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X, User, CircleUserRound } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import UserInfoCard from '../user_info_card/UserInfoCard.jsx';

function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserInfoCard, setShowUserInfoCard] = useState(false);
  //update: Add state for scroll behavior
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const burgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const {
    showShopCreationForm, 
    selectedShop,
  } = useShop();
  
  const {
    currentUser,
    setIsLoggingIn
  } = useAuth();
  
  const {
    showShopWindow,
    setShowShopWindow,
    setShowLandingPage,
    showProductManagement,
    showShopsListBySeller,
    showShopStore,
    showInfoManagement,
    //update: Added setShowInfoManagement to handle navigation
    setShowInfoManagement
  } = useUI();
  
  const {
    isUpdatingProduct
  } = useProduct();
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  //update: Add scroll handler
  useEffect(() => {
    const controlTopBar = () => {
      const currentScrollY = window.scrollY;
      
      // Define scroll threshold
      const scrollThreshold = 10;
      
      // If mobile menu is open, keep TopBar visible
      if (mobileMenuOpen) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // Show TopBar when at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
      }
      // Hide when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        setIsVisible(false);
      }
      // Show when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Add scroll event listener with throttling for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          controlTopBar();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLoginClick = () => {
    //update: Handle login from InfoManagement
    if (showInfoManagement) {
      setShowInfoManagement(false);
    }
    setShowShopWindow(false);
    setShowLandingPage(false);
    setIsLoggingIn(true);
    setMobileMenuOpen(false);
  };
  
  const handleProfileClick = () => {
    setShowUserInfoCard(true);
    setMobileMenuOpen(false);
  };
  
  const handleCloseUserInfoCard = () => {
    setShowUserInfoCard(false);
  };
  
  const shouldShowBackButton = () => {
    //update: Add InfoManagement back button
    if (showInfoManagement) return true;
    if (showShopStore) return true;
    if (showShopCreationForm) return true;
    if (selectedShop && showProductManagement) return true;
    if (showShopsListBySeller && currentUser?.type_user === 'seller') return true;
    if (showShopWindow) return true;
    if (isUpdatingProduct) return true;
    return false;
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        burgerButtonRef.current && 
        !burgerButtonRef.current.contains(e.target) &&
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(e.target) &&
        mobileMenuOpen
      ) {
        setMobileMenuOpen(false);
      }
    };
    
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/*update: Add dynamic className based on visibility state */}
      <div className={`${styles.container} ${isVisible ? styles.visible : styles.hidden}`}>
        <div className={styles.contentWrapper}>
          <div className={styles.titleWrapper}>
              <span className={styles.title}>
                uribarri.online
              </span>
          </div>

          <div className={styles.buttonsContainer}>
            {currentUser ? (
              <>
                <button 
                  type="button" 
                  className={styles.profileButton} 
                  onClick={handleProfileClick}
                  title="Ver perfil"
                >
                  <CircleUserRound size={16}/>
                  <span>Mi Perfil</span>
                </button>
                <button 
                  type="button" 
                  className={styles.active} 
                  onClick={clearUserSession}
                  title="Cerrar sesión"
                >
                  <span>Cerrar</span>
                  <DoorClosed size={16}/>
                </button>
              </>
            ) : (
              //update: Show login button in both ShopWindow and InfoManagement
              (showShopWindow || showInfoManagement) && (
                <button 
                  type="button" 
                  className={styles.loginButton} 
                  onClick={handleLoginClick}
                  title="Registrarse o iniciar sesión"
                >
                  <img 
                    src="/images/icons/Register.png" 
                    alt="Login" 
                    className={styles.loginIcon}
                    width={30}
                    height={30}
                  />
                  <span>ENTRAR</span>
                </button>
              )
            )}
          </div>

          {/* update: Show burger menu for logged in users OR non-logged in users in ShopWindow/InfoManagement */}
          {(currentUser || (!currentUser && (showShopWindow || showInfoManagement))) && (
            <div className={styles.mobileMenuContainer}>
              <button 
                className={`${styles.burgerButton} ${mobileMenuOpen ? styles.active : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Menu"
                ref={burgerButtonRef}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div 
                className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}
                ref={mobileMenuRef}
              >
                {shouldShowBackButton() && (
                  <>
                    <button
                      className={styles.backButton}
                      onClick={() => {
                        handleBack();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <ArrowLeft size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Volver</span>
                    </button>
                    
                    {currentUser && <div className={styles.menuDivider}></div>}
                  </>
                )}

                {currentUser ? (
                  <>
                    <button 
                      className={styles.profileMenuButton}
                      onClick={handleProfileClick}
                    >
                      <CircleUserRound size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Mi Perfil</span>
                    </button>
                    
                    <div className={styles.menuDivider}></div>
                    
                    <button 
                      className={styles.logoutButton}
                      onClick={() => {
                        clearUserSession();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <DoorClosed size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  //update: Show login button in mobile menu for both ShopWindow and InfoManagement
                  (showShopWindow || showInfoManagement) && (
                    <button 
                      className={styles.loginButton}
                      onClick={handleLoginClick}
                    >
                      <img 
                        src="/images/icons/Register.png" 
                        alt="Login" 
                        className={styles.buttonIcon}
                        width={16}
                        height={16}
                      />
                      <span className={styles.buttonText}>entrar</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {currentUser && showUserInfoCard && (
        <UserInfoCard onClose={handleCloseUserInfoCard} />
      )}
    </>
  );
}

export default TopBar;