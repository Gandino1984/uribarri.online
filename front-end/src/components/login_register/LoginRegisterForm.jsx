import React from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import ShopManagement from "../shop_management/ShopManagement.jsx";
import LandingPage from "../landing_page/LandingPage.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import styles from '../../../../public/css/LoginRegisterForm.module.css';

const FormContent = () => {
  return (
    <div className={styles.formContentWrapper}>
      <FormActions />
      <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
        <FormFields />
        <KeyboardSection />
      </form>
    </div>
  );
};

const LoginRegisterForm = () => {
  const { currentUser, type_user } = useAuth();
  const { showShopManagement, showLandingPage, setShowLandingPage } = useUI();

  // Handler to proceed from landing to login/register form
  const handleProceedToLogin = () => {
    setShowLandingPage(false);
  };

  // if logged in
  if (showShopManagement || currentUser) { 
    const userType = currentUser?.type_user || type_user;
    if (userType === 'seller') {
      return <ShopManagement />;
    } else {
      return <LandingPage />;
    }
  }

  // If not logged in, show either landing page or login/register form
  if (showLandingPage) {
    return <LandingPage onProceedToLogin={handleProceedToLogin} />;
  }

  // if not logged or not registered but past landing page
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <FormContent />
      </div>
    </div>
  );
};

export default LoginRegisterForm;