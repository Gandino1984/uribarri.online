import { useState, useRef, useEffect } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X, LogIn } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useProduct } from '../../app_context/ProductContext.jsx';
import UserInfoCard from '../user_info_card/UserInfoCard.jsx';
import userInfoStyles from '../../../../public/css/UserInfoCard.module.css';
import AnimatedO from './components/AnimatedO.jsx';

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
    //update: Add showShopStore
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
  
  //update: Function to determine if back button should be shown
  const shouldShowBackButton = () => {
    // Show back button in various scenarios
    if (showShopStore) return true; // Add this line
    if (showShopCreationForm) return true;
    if (selectedShop && showProductManagement) return true;
    if (showShopsListBySeller && currentUser?.type_user === 'seller') return true;
    if (showShopWindow && !currentUser) return true;
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
  
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const menu = mobileMenuRef.current;
      const rect = menu.getBoundingClientRect();
      
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        menu.style.top = 'auto';
        menu.style.bottom = '100%';
        menu.style.marginTop = '0';
        menu.style.marginBottom = '0.5rem';
        menu.style.setProperty('--triangle-direction', 'down');
      } else {
        menu.style.top = '100%';
        menu.style.bottom = 'auto';
        menu.style.marginTop = '0.5rem';
        menu.style.marginBottom = '0';
        menu.style.setProperty('--triangle-direction', 'up');
      }
      
      const viewportWidth = window.innerWidth;
      if (rect.right > viewportWidth) {
        menu.style.right = '0';
        menu.style.left = 'auto';
      }
    }
  }, [mobileMenuOpen]);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
          <span className={styles.title}>
            uribarri.<AnimatedO />nline
          </span>

          {currentUser && (
            <div className={styles.userInfoWrapper}>
              <UserInfoCard />
            </div>
          )}

          <div className={styles.buttonsContainer}>
            {shouldShowBackButton() && (
              <button
                className={styles.backButton}
                onClick={handleBack}
                title="Volver"
              >
                  <ArrowLeft size={16} />
              </button>
            )}

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
                  <span>Registrarse o iniciar sesión</span>
                  <LogIn size={16}/>
                </button>
              )
            )}
          </div>

          {/* Show burger menu for both logged in users and non-logged in users in ShopWindow */}
          {(currentUser || (!currentUser && showShopWindow)) && (
            <button 
              className={styles.burgerButton} 
              onClick={toggleMobileMenu}
              aria-label="Menu"
              ref={burgerButtonRef}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          {mobileMenuOpen && (
            <div 
              className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}
              ref={mobileMenuRef}
            >
              {shouldShowBackButton() && (
                <button
                className={styles.active}
                  onClick={() => {
                    handleBack();
                    setMobileMenuOpen(false);
                  }}
                >
                  <ArrowLeft size={16} className={styles.buttonIcon} />
                  <span className={styles.buttonText}>Volver</span>
                </button>
              )}

              {currentUser ? (
                <button 
                className={styles.active}
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
                    <LogIn size={16} className={styles.buttonIcon} />
                    <span className={styles.buttonText}>Registrarse o iniciar sesión</span>
                  </button>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default TopBar;