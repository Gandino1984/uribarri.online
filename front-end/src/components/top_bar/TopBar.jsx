// import React from 'react';
import { useState } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed, Menu, X } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';

function TopBar() {
  // 🍔 UPDATE: Added state for mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

          <button 
            className={styles.active} 
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 🍔 UPDATE: Added mobile menu with dropdown functionality */}
          <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
            {(selectedShop || showShopCreationForm) && (
              <button
                className={styles.backButton}
                onClick={() => {
                  handleBack();
                  setMobileMenuOpen(false);
                }}
                title="Volver"
              >
                <ArrowLeft size={16} />
                <span>Volver</span>
              </button>
            )}

            {currentUser && (
              <button 
                type="button" 
                className={styles.active} 
                onClick={() => {
                  clearUserSession();
                  setMobileMenuOpen(false);
                }}
                title="Cerrar sesión"
              >
                <DoorClosed size={16}/>
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
      </div>
    </div>
  );
}

export default TopBar;