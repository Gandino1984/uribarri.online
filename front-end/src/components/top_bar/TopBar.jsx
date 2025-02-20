import React, { useContext } from 'react';
import styles from '../../../../public/css/TopBar.module.css';
import { TopBarFunctions } from './TopBarFunctions.jsx';
import { ArrowLeft, DoorClosed } from 'lucide-react';
import AppContext from '../../app_context/AppContext.js';
import ErrorCard from './error_card/ErrorCard.jsx';
import SuccessCard from './success_card/SuccessCard.jsx';
import UserInfoCard from './user_info_card/UserInfoCard.jsx';
import InfoCard from './info_card/InfoCard.jsx';

function TopBar() {
  const {
    error,
    success,
    info,
    showShopCreationForm, 
    selectedShop,
  } = useContext(AppContext);
  
  const {
    handleBack,
    clearUserSession
  } = TopBarFunctions();

  return (
    <div className={styles.container}>
        <div className={styles.messageWrapper}>
          {error && <ErrorCard />}
          {success && <SuccessCard />}
          {info && <InfoCard />}
        </div>
        
        <div className={styles.contentWrapper}>
          {(selectedShop || showShopCreationForm) && (
            <button
              className={styles.backButton}
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <UserInfoCard />

          <button 
            type="button" 
            className={styles.logoutButton} 
            onClick={clearUserSession}
          >
              Cerrar
              <DoorClosed size={16}/>
          </button>
        </div>
    </div>
  );
}

export default TopBar;