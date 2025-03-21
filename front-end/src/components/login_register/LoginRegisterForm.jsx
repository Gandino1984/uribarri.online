import React, { useContext, useState } from 'react';

import AppContext from '../../app_context/AppContext.js';
import UserLanding from "../user_landing/UserLanding.jsx";
import ShopManagement from "../shop_management/ShopManagement.jsx";

import { LoginRegisterUtils } from './LoginRegisterUtils.jsx';
import { FormFields } from './components/FormFields.jsx';
import { KeyboardSection } from './components/KeyboardSection';
import { FormActions } from './components/FormActions';

import styles from '../../../../public/css/LoginRegisterForm.module.css';

const FormContent = () => {

  const { handleFormSubmit } = LoginRegisterUtils();

  return (
    <form className={styles.formContent} onSubmit={handleFormSubmit}>
      <FormFields />
      <KeyboardSection />
    </form>
  );
};

const LoginRegisterForm = () => {

  const {
    currentUser,
    showShopManagement,
    type_user,
  } = useContext(AppContext);

  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index) => {
    setToggleState(index);
  };

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