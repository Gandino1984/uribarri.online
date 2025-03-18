import React, { useContext, useState } from 'react';

import AppContext from '../../app_context/AppContext.js';
import UserManagement from "../user_management/UserManagement.jsx";
import ShopManagement from "../shop_management/ShopManagement.jsx";

import { LoginRegisterFunctions } from './LoginRegisterFunctions.jsx';
import { FormFields } from './FormFields.jsx';
import { KeyboardSection } from './KeyboardSection';
import { FormActions } from './FormActions';

import styles from '../../../../public/css/LoginRegisterForm.module.css';

const FormContent = () => {

  const { handleFormSubmit } = LoginRegisterFunctions();

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
      return <UserManagement />;
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