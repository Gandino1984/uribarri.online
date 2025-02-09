// components/LoginRegisterForm/LoginRegisterForm.jsx
import React, { useContext } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { DoorOpen } from 'lucide-react';
import AppContext from '../../../app_context/AppContext.js';
import { LoginRegisterFunctions } from './hooks/LoginRegisterFunctions.jsx';
import { fadeInScale } from '../../../utils/animation/transitions.js';
import { FormFields } from './FormFields.jsx';
import { KeyboardSection } from './KeyboardSection';
import { FormActions } from './FormActions';
import styles from '../../../../../public/css/LoginRegisterForm.module.css';
import UserManagement from "../../user_management/UserManagement.jsx";
import ShopManagement from "../../shop_management/ShopManagement.jsx";

const LoginRegisterForm = () => {
  const {
    currentUser,
    showShopManagement,
    type_user,
  } = useContext(AppContext);

  const transitions = useTransition(!showShopManagement && !currentUser, fadeInScale);

  if (showShopManagement || currentUser) {
    return type_user === 'seller' ? <ShopManagement /> : <UserManagement />;
  }

  return transitions((style, show) =>
    show && (
      <animated.div style={style} className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.formContentWrapper}>
            <FormContent />
          </div>
          <FormActions />
        </div>
      </animated.div>
    )
  );
};

const FormContent = () => {
  const { handleFormSubmit } = LoginRegisterFunctions();

  return (
    <form className={styles.formContent} onSubmit={handleFormSubmit}>
      <FormFields />
      <KeyboardSection />
    </form>
  );
};

export default LoginRegisterForm;