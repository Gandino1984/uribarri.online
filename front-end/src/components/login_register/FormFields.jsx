import React, { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import { LoginRegisterFunctions } from './LoginRegisterFunctions.jsx';
import styles from '../../../../public/css/LoginRegisterForm.module.css'; 

export const FormFields = () => {
  const {
    name_user,
    usernameError,
    isLoggingIn,
    type_user,
    location_user,
    userlocationError,
  } = useContext(AppContext);

  const {
    handleUsernameChange,
    handleUserTypeChange,
    handleUserLocationChange,
  } = LoginRegisterFunctions();

  return (
    <div className={styles.inputSection}>
      <div className={styles.formField}>
        <input
          id="name_user"
          type="text"
          value={name_user}
          onChange={handleUsernameChange}
          className={usernameError ? styles.inputError : styles.nameInput}
          placeholder={type_user === 'seller' ? 'Nombre de vendedora:' : 'Nombre de Usuaria:'}
          required
        />

        {!isLoggingIn && (
          <>
            <select 
              value={type_user} 
              onChange={handleUserTypeChange}
              required
            >
              <option value="" disabled>Tipo de usuaria</option>
              <option value="user">Usuaria</option>
              <option value="seller">vendedora</option>
              <option value="provider" disabled>Productora</option>
            </select>
          
            <input
              id="location_user"
              type="text"
              value={location_user}
              onChange={handleUserLocationChange}
              className={userlocationError ? styles.inputError : ''}
              placeholder={type_user === 'seller' ? 'Dirección de vendedora:' : 'Dirección de Usuaria:'}
              required 
            />
          </>
        )}
      </div>
    </div>
  );
};