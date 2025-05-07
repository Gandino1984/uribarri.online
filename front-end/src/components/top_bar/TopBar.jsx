// import React from 'react';
import { useState, useRef, useEffect } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';

function TopBar() {
  // 🍔 UPDATE: Added state for mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 🔻 UPDATE: Added refs for menu positioning
  const burgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const {
    showShopCreationForm, 
    selectedShop,
  } = useShop();
  
  const {
    currentUser
  } = useAuth();
  
  const {
    handleBack,
    clearUserSession
  } = TopBarUtils();

  // 🍔 UPDATE: Added toggle function for mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // 🔻 UPDATE: Added click outside handler to close menu
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
    
    // Add event listener with a small delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  // 🔻 UPDATE: Added effect to position popup correctly
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const menu = mobileMenuRef.current;
      const rect = menu.getBoundingClientRect();
      
      // Check if menu is cut off at the bottom of the viewport
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        menu.style.top = 'auto';
        menu.style.bottom = '100%';
        menu.style.marginTop = '0';
        menu.style.marginBottom = '0.5rem';
        
        // Adjust the pointer triangle to point down instead of up
        menu.style.setProperty('--triangle-direction', 'down');
      } else {
        menu.style.top = '100%';
        menu.style.bottom = 'auto';
        menu.style.marginTop = '0.5rem';
        menu.style.marginBottom = '0';
        
        // Default pointer triangle pointing up
        menu.style.setProperty('--triangle-direction', 'up');
      }
      
      // Make sure menu is fully visible within viewport width
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
          <span className={styles.title}>uribarri.online</span>

          {/* 🍔 UPDATE: Added buttons container for desktop view */}
          <div className={styles.buttonsContainer}>
            {(selectedShop || showShopCreationForm) && (
              <button
                className={styles.backButton}
                onClick={handleBack}
                title="Volver"
              >
                  <ArrowLeft size={16} />
              </button>
            )}

            {currentUser && (
              <button 
                type="button" 
                className={styles.active} 
                onClick={clearUserSession}
                title="Cerrar sesión"
              >
                  <span>Cerrar</span>
                  <DoorClosed size={16}/>
              </button>
            )}
          </div>

          {/* 🔻 UPDATE: Updated burger button with ref */}
          <button 
            className={styles.active} 
            onClick={toggleMobileMenu}
            aria-label="Menu"
            ref={burgerButtonRef}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 🔻 UPDATE: Updated mobile menu with ref and new styling */}
          {mobileMenuOpen && (
            <div 
              className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}
              ref={mobileMenuRef}
            >
              {(selectedShop || showShopCreationForm) && (
                <button
                  onClick={() => {
                    handleBack();
                    setMobileMenuOpen(false);
                  }}
                >
                  <ArrowLeft size={16} className={styles.buttonIcon} />
                  <span className={styles.buttonText}>Volver</span>
                </button>
              )}

              {currentUser && (
                <button 
                  onClick={() => {
                    clearUserSession();
                    setMobileMenuOpen(false);
                  }}
                >
                  <DoorClosed size={16} className={styles.buttonIcon} />
                  <span className={styles.buttonText}>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default TopBar;