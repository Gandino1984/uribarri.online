//update: Enhanced to support public navigation for ShopWindow and InfoManagement
import { useState, useRef, useEffect } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X, CircleUserRound, RefreshCw, ShoppingBag, Newspaper } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import UserInfoCard from '../user_info_card/UserInfoCard.jsx';

function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserInfoCard, setShowUserInfoCard] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
    setShowInfoManagement,
    //update: Add setters for navigation
    setShowShopsListBySeller,
    setShowShopManagement
  } = useUI();
  
  const {
    isUpdatingProduct
  } = useProduct();
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  useEffect(() => {
    const controlTopBar = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;
      
      if (mobileMenuOpen) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
      }
      else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        setIsVisible(false);
      }
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
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
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };
  
  //update: Public navigation handlers
  const handleShopWindowClick = () => {
    console.log('TopBar: Navigating to ShopWindow');
    setShowShopWindow(true);
    setShowLandingPage(false);
    setShowShopManagement(false);
    setShowInfoManagement(false);
    setShowShopsListBySeller(false);
    setMobileMenuOpen(false);
  };
  
  const handleInfoManagementClick = () => {
    console.log('TopBar: Navigating to InfoManagement');
    setShowInfoManagement(true);
    setShowLandingPage(false);
    setShowShopManagement(false);
    setShowShopWindow(false);
    setShowShopsListBySeller(false);
    setMobileMenuOpen(false);
  };
  
  const shouldShowBackButton = () => {
    if (showInfoManagement) return true;
    if (showShopStore) return true;
    if (showShopCreationForm) return true;
    if (selectedShop && showProductManagement) return true;
    if (showShopsListBySeller && currentUser?.type_user === 'seller') return true;
    if (showShopWindow) return true;
    if (isUpdatingProduct) return true;
    return false;
  };
  
  //update: Show navigation buttons in desktop view
  const shouldShowPublicNav = () => {
    return !showShopsListBySeller && !showProductManagement && !showShopCreationForm;
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
      <div className={`${styles.container} ${isVisible ? styles.visible : styles.hidden}`}>
        <div className={styles.contentWrapper}>
          <div className={styles.titleWrapper}>
              <span className={styles.title}>
                uribarri.online
              </span>
          </div>

          {/*update: Public navigation buttons in desktop view */}
          {shouldShowPublicNav() && (
            <div className={styles.publicNavButtons}>
              <button 
                type="button" 
                className={`${styles.navButton} ${showShopWindow ? styles.activeNav : ''}`}
                onClick={handleShopWindowClick}
                title="Ver comercios"
              >
                <ShoppingBag size={18} />
                <span>Comercios</span>
              </button>
              
              <button 
                type="button" 
                className={`${styles.navButton} ${showInfoManagement ? styles.activeNav : ''}`}
                onClick={handleInfoManagementClick}
                title="Ver tablón informativo"
              >
                <Newspaper size={18} />
                <span>Tablón</span>
              </button>
            </div>
          )}

          <div className={styles.buttonsContainer}>
            {currentUser ? (
              <>
                <button 
                  type="button" 
                  className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ''}`}
                  onClick={handleRefresh}
                  title="Refrescar página"
                >
                  <RefreshCw size={16} className={styles.refreshIcon}/>
                  <span>Refrescar</span>
                </button>
                
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
              //update: Show login button for anonymous users on public pages
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
                    
                    <div className={styles.menuDivider}></div>
                  </>
                )}

                {/*update: Public navigation in mobile menu */}
                {shouldShowPublicNav() && (
                  <>
                    <button 
                      className={`${styles.navMenuButton} ${showShopWindow ? styles.activeNav : ''}`}
                      onClick={handleShopWindowClick}
                    >
                      <ShoppingBag size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Comercios</span>
                    </button>
                    
                    <button 
                      className={`${styles.navMenuButton} ${showInfoManagement ? styles.activeNav : ''}`}
                      onClick={handleInfoManagementClick}
                    >
                      <Newspaper size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Tablón</span>
                    </button>
                    
                    <div className={styles.menuDivider}></div>
                  </>
                )}

                {currentUser ? (
                  <>
                    <button 
                      className={`${styles.refreshMenuButton} ${isRefreshing ? styles.refreshing : ''}`}
                      onClick={handleRefresh}
                    >
                      <RefreshCw size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Refrescar</span>
                    </button>
                    
                    <div className={styles.menuDivider}></div>
                    
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
                  //update: Login button for anonymous users in mobile menu
                  (showShopWindow || showInfoManagement) && (
                    <button 
                      className={styles.loginMenuButton}
                      onClick={handleLoginClick}
                    >
                      <img 
                        src="/images/icons/Register.png" 
                        alt="Login" 
                        className={styles.buttonIcon}
                        width={16}
                        height={16}
                      />
                      <span className={styles.buttonText}>ENTRAR</span>
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