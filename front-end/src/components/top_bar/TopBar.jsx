// import React from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarUtils } from './TopBarUtils.jsx';
import { ArrowLeft, DoorClosed } from 'lucide-react';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useAuth } from '../../app_context/AuthContext.jsx';

function TopBar() {
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

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
          {(selectedShop || showShopCreationForm) && (
            <button
              className={styles.backButton}
              onClick={handleBack}
              title="Volver"
            >
                <ArrowLeft size={16} />
            </button>
          )}

          <span className={styles.title}>Orain.online</span>

          {/* 🔄 UPDATE: Removed UserInfoCard from TopBar */}

          {currentUser && (
            <button 
              type="button" 
              className={styles.logoutButton} 
              onClick={clearUserSession}
              title="Cerrar sesión"
            >
                <span>Cerrar</span>
                <DoorClosed size={16}/>
            </button>
          )}
      </div>
    </div>
  );
}

export default TopBar;