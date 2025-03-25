import React from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx';
import NumericKeyboard from "./numeric_keyboard/NumericKeyboard.jsx";
import styles from '../../../../../public/css/LoginRegisterForm.module.css';

export const KeyboardSection = () => {
  // UPDATE: Using useAuth and useUI hooks instead of AppContext
  const {
    isLoggingIn,
    keyboardKey,
    passwordRepeat,
    password,
    showPasswordRepeat,
  } = useAuth();

  const { error } = useUI();
  const usernameError = error.userError;
  const passwordError = error.passwordError;

  const {
    handlePasswordComplete,
    handleRepeatPasswordChange,
    handlePasswordChange,
  } = LoginRegisterUtils();

  return (
    <div className={styles.keyboardSection}>
      <div className={styles.numericKeyboardWrapper}>
        <NumericKeyboard
          key={keyboardKey}
          value={!isLoggingIn && showPasswordRepeat ? passwordRepeat : password}
          onChange={!isLoggingIn && showPasswordRepeat 
            ? handleRepeatPasswordChange 
            : (newPassword) => handlePasswordChange(isLoggingIn, newPassword)}
          onPasswordComplete={handlePasswordComplete(isLoggingIn)}
          error={!!usernameError || !!passwordError}
        />
      </div>
    </div>
  );
};