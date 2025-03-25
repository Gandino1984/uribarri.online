import React from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx';
import styles from '../../../../../public/css/LoginRegisterForm.module.css'; 

export const FormFields = () => {
  // UPDATE: Using useAuth and useUI hooks instead of AppContext
  const {
    name_user,
    isLoggingIn,
    type_user,
    location_user,
  } = useAuth();

  const { error } = useUI();
  const usernameError = error.userError;
  const userlocationError = error.userlocationError;

  const {
    handleUsernameChange,
    handleUserTypeChange,
    handleUserLocationChange,
  } = LoginRegisterUtils();

  return (
    <div className={styles.inputSection}>
      <div className={styles.formField}>
        <input
          id="name_user"
          type="text"
          value={name_user}
          onChange={handleUsernameChange}
          className={usernameError ? styles.inputError : styles.nameInput}
          placeholder={type_user === 'seller' ? 'Nombre de vendedor:' : 'Nombre de usuario:'}
          required
        />

        {!isLoggingIn && (
          <>
            <select 
              value={type_user} 
              onChange={handleUserTypeChange}
              className={type_user ? 'has-value' : ''}
              required
            >
              <option value="" disabled>Tipo de usuario</option>
              <option value="user">usuario</option>
              <option value="seller">vendedor</option>
              <option value="provider" disabled>Productora</option>
            </select>
          
            <input
              id="location_user"
              type="text"
              value={location_user}
              onChange={handleUserLocationChange}
              className={userlocationError ? styles.inputError : ''}
              placeholder={type_user === 'seller' ? 'Dirección de vendedor:' : 'Dirección de usuario:'}
              required 
            />
          </>
        )}
      </div>
    </div>
  );
};