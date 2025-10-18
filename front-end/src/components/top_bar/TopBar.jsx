//update: Added ChangePassword modal functionality for logged-in users
import { useState, useRef, useEffect } from 'react';
import styles from '../../../css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X, CircleUserRound, RefreshCw, ShoppingBag, Newspaper, Lock, Store } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import UserInfoCard from '../user_info_card/UserInfoCard.jsx';
//update: Import ChangePassword component
import ChangePassword from '../email_verification/ChangePassword.jsx';

function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserInfoCard, setShowUserInfoCard] = useState(false);
  //update: Add state for ChangePassword modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const burgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const {
    showShopCreationForm, 
    selectedShop,
    showShopManagement,
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

  const getTitleColorClass = () => {
    if (showInfoManagement) {
      return styles.titleGreen;
    }
    if (showShopWindow || showShopStore || showShopManagement || showShopsListBySeller || showProductManagement) {
      return styles.titlePurple;
    }
    return styles.titlePurple;
  };

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
  
  //update: Handler for opening ChangePassword modal
  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    setMobileMenuOpen(false);
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };
  
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

  //update: Handler for navigating to shop management (for sellers)
  const handleMyShopsClick = () => {
    console.log('TopBar: Navigating to ShopsListBySeller (My Shops)');
    setShowShopsListBySeller(true);
    setShowShopManagement(true);
    setShowShopWindow(false);
    setShowInfoManagement(false);
    setShowLandingPage(false);
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
              <span className={`${styles.title} ${getTitleColorClass()}`}>
                uribarri.online
              </span>
          </div>

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
                className={`${styles.navButton} ${showInfoManagement ? styles.activeNavGreen : ''}`}
                onClick={handleInfoManagementClick}
                title="Ver tablón informativo"
              >
                <Newspaper size={18} />
                <span>Tablón</span>
              </button>

              {/*update: Add My Shops button for sellers*/}
              {currentUser?.type_user === 'seller' && (
                <button
                  type="button"
                  className={`${styles.navButton} ${showShopsListBySeller ? styles.activeNav : ''}`}
                  onClick={handleMyShopsClick}
                  title="Gestionar mis comercios"
                >
                  <Store size={18} />
                  <span>Mis Comercios</span>
                </button>
              )}
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
                
                {/*update: Add Change Password button*/}
                <button 
                  type="button" 
                  className={styles.changePasswordButton}
                  onClick={handleChangePasswordClick}
                  title="Cambiar contraseña"
                >
                  <Lock size={16}/>
                  <span>Contraseña</span>
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

                {shouldShowPublicNav() && (
                  <>
                    <button
                      className={` ${styles.navMenuButton} ${showShopWindow ? styles.activeNav : ''}`}
                      onClick={handleShopWindowClick}
                    >
                      <ShoppingBag size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Escaparate</span>
                    </button>

                    <button
                      className={`${styles.navMenuButton} ${showInfoManagement ? styles.activeNavGreen : ''}`}
                      onClick={handleInfoManagementClick}
                    >
                      <Newspaper size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Tablón</span>
                    </button>

                    {/*update: Add My Shops button for sellers in mobile menu*/}
                    {currentUser?.type_user === 'seller' && (
                      <button
                        className={`${styles.navMenuButton} ${showShopsListBySeller ? styles.activeNav : ''}`}
                        onClick={handleMyShopsClick}
                      >
                        <Store size={16} className={styles.buttonIcon} />
                        <span className={styles.buttonText}>Mis Comercios</span>
                      </button>
                    )}

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
                    
                    {/*update: Add Change Password button to mobile menu*/}
                    <button 
                      className={styles.changePasswordMenuButton}
                      onClick={handleChangePasswordClick}
                    >
                      <Lock size={16} className={styles.buttonIcon} />
                      <span className={styles.buttonText}>Cambiar contraseña</span>
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
      
      {/*update: Add ChangePassword modal*/}
      <ChangePassword 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}

export default TopBar;