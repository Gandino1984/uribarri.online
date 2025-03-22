import React from 'react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import UserLanding from "../user_landing/UserLanding.jsx";
import ShopManagement from "../shop_management/ShopManagement.jsx";
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';
import styles from '../../../../public/css/LoginRegisterForm.module.css';

const FormContent = () => {
  // Use the LoginRegisterUtils (which now uses the split contexts)
  // This forms content stays the same
  return (
    <form className={styles.formContent} onSubmit={(e) => e.preventDefault()}>
      <FormFields />
      <KeyboardSection />
    </form>
  );
};

const LoginRegisterForm = () => {
  // UPDATE: Using separate contexts instead of AppContext
  const { currentUser, type_user } = useAuth();
  const { showShopManagement } = useUI();

  // if logged
  if (showShopManagement || currentUser) { 
    const userType = currentUser?.type_user || type_user;
    if (userType === 'seller') {
      return <ShopManagement />;
    } else {
      return <UserLanding />;
    }
  }

  // if not logged or not registered
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <FormActions />
        <FormContent />
      </div>
    </div>
  );
};

export default LoginRegisterForm;