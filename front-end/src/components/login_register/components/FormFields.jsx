import React from 'react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx';
import styles from '../../../../../public/css/LoginRegisterForm.module.css'; 

export const FormFields = () => {
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
          placeholder={type_user === 'seller' ? 'Nombre de vendedor:' : 'Nombre de usuari@:'}
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
              <option value="" disabled>Tipo:</option>
              <option value="user">Usuaria/o</option>
              <option value="seller">Vendedor/a</option>
              <option value="rider">Repartidor/a</option>
              <option value="handler" disabled>Gestor/a de tienda</option>
              <option value="provider" disabled>Productor/a</option>
            </select>
          
            <input
              id="location_user"
              type="text"
              value={location_user}
              onChange={handleUserLocationChange}
              className={userlocationError ? styles.inputError : ''}
              placeholder={type_user === 'seller' ? 'Dirección de vendedor:' : 'Dirección de usuari@:'}
              required 
            />
          </>
        )}
      </div>
    </div>
  );
};