import React, { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import { LoginRegisterFunctions } from './LoginRegisterFunctions.jsx';
import NumericKeyboard from "./numeric_keyboard/NumericKeyboard.jsx";
import styles from '../../../../public/css/LoginRegisterForm.module.css';

export const KeyboardSection = () => {
  const {
    isLoggingIn,
    showRepeatPasswordMessage,
    keyboardKey,
    passwordRepeat,
    password,
    showPasswordRepeat,
    usernameError,
    passwordError,
  } = useContext(AppContext);

  const {
    handlePasswordComplete,
    handleRepeatPasswordChange,
    handlePasswordChange,
  } = LoginRegisterFunctions();

  return (
    <div className={styles.keyboardSection}>
      {!isLoggingIn && showRepeatPasswordMessage && (
        <div className={styles.repeatPasswordMessage}>
          Repite la contraseña
        </div>
      )}

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