//update: Removed organization_manager from user type options
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx';
import styles from '../../../../css/LoginRegisterForm.module.css'; 

export const FormFields = () => {
  const {
    name_user,
    email_user,
    isLoggingIn,
    type_user,
    location_user,
  } = useAuth();

  const { error } = useUI();
  const usernameError = error.userError;
  const userlocationError = error.userlocationError;
  const emailError = error.emailError;

  const {
    handleUsernameChange,
    handleUserTypeChange,
    handleUserLocationChange,
    handleEmailChange,
  } = LoginRegisterUtils();

  //update: Added state for email validation status
  const [emailValidationClass, setEmailValidationClass] = useState('');
  
  //update: Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  //update: Email validation effect
  useEffect(() => {
    if (!isLoggingIn && email_user) {
      if (emailRegex.test(email_user)) {
        setEmailValidationClass('inputValid');
      } else {
        setEmailValidationClass('inputInvalid');
      }
    } else {
      setEmailValidationClass('');
    }
  }, [email_user, isLoggingIn]);

  return (
    <div className={styles.inputSection}>
      <div className={styles.formField}>
        <input
          id="name_user"
          type="text"
          value={name_user}
          onChange={handleUsernameChange}
          className={usernameError ? styles.inputError : styles.nameInput}
          placeholder={type_user === 'seller' ? 'Nombre de vendedor:' : 'Nombre de usuari@:'}
          required
        />

        {!isLoggingIn && (
          <>
            {/*update: Added email input field with validation*/}
            <input
              id="email_user"
              type="email"
              value={email_user}
              onChange={handleEmailChange}
              className={`${emailError ? styles.inputError : ''} ${emailValidationClass}`}
              placeholder="Correo electrónico:"
              required
            />
            
            <input
              id="location_user"
              type="text"
              value={location_user}
              onChange={handleUserLocationChange}
              className={userlocationError ? styles.inputError : ''}
              placeholder={type_user === 'seller' ? 'Dirección de vendedor:' : 'Dirección de usuari@:'}
              required 
            />

            <select 
              value={type_user} 
              onChange={handleUserTypeChange}
              className={type_user ? 'has-value' : ''}
              required
            >
              <option value="" disabled>Tipo:</option>
              <option value="user">Usuaria/o</option>
              <option value="seller">Vendedor/a</option>
              <option value="rider">Repartidor/a</option>
              <option value="shop_handler" disabled>Gestor/a de tienda</option>
              <option value="shop_provider" disabled>Mayorista</option>
            </select>
          </>
        )}
      </div>
    </div>
  );
};