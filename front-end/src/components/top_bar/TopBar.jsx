import { useState, useRef, useEffect } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import UserInfoCard from '../user_info_card/UserInfoCard.jsx';

function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    showShopStore
  } = useUI();
  
  const {
    isUpdatingProduct
  } = useProduct();
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLoginClick = () => {
    setShowShopWindow(false);
    setShowLandingPage(false);
    setIsLoggingIn(true);
    setMobileMenuOpen(false);
  };
  
  //update: Modified to always show back button when in ShopWindow
  const shouldShowBackButton = () => {
    if (showShopStore) return true;
    if (showShopCreationForm) return true;
    if (selectedShop && showProductManagement) return true;
    if (showShopsListBySeller && currentUser?.type_user === 'seller') return true;
    if (showShopWindow) return true; // Show back button for all users in ShopWindow
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
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.titleWrapper}>
            <span className={styles.title}>
              uribarri.online
            </span>
        </div>

        {currentUser && (
          <div className={styles.userInfoWrapper}>
            <UserInfoCard />
          </div>
        )}

        <div className={styles.buttonsContainer}>
          {currentUser ? (
            <button 
              type="button" 
              className={styles.active} 
              onClick={clearUserSession}
              title="Cerrar sesión"
            >
              <span>Cerrar</span>
              <DoorClosed size={16}/>
            </button>
          ) : (
            showShopWindow && (
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

        {/* Show burger menu for both logged in users and non-logged in users in ShopWindow */}
        {(currentUser || (!currentUser && showShopWindow)) && (
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
              ) : (
                showShopWindow && (
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
  );
}

export default TopBar;