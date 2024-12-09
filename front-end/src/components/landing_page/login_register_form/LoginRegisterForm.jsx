
import React, { useContext} from 'react';
import AppContext from '../../../app_context/AppContext.js';
import { LoginRegisterFunctions } from './hooks/LoginRegisterFunctions.jsx';
import NumericKeyboard from "../numeric_keyboard/NumericKeyboard.jsx";
import UserManagement from "../../user_management/UserManagement.jsx";
import styles from './LoginRegisterForm.module.css';
import ShopManagement from "../../shop_management/ShopManagement.jsx";

const LoginRegisterForm = () => {
  const {
    username, isLoggingIn, userType, 
    showShopManagement, setshowShopManagement,
    password, passwordRepeat, showPasswordRepeat,
    keyboardKey, usernameError, passwordError,
    ipError, locationUser, setLocationUser,
    shopName, setShopName, shopLocation, setShopLocation,
    shopType, setShopType, shopSubtype, setShopSubtype
  } = useContext(AppContext);

  const {
    handlePasswordComplete,
    handleClear, handlePasswordChange,
    handleRepeatPasswordChange, isButtonDisabled,
    toggleForm, handleFormSubmit, 
    handleUserTypeChange, handleUsernameChange, 
  } = LoginRegisterFunctions();

  /* If the business selector is shown, render 
  the ShopManagement or UserManagement component */
  if (showShopManagement) {
    console.log('-> LoginRegisterForm - showShopManagement = ', showShopManagement);
    console.log('-> userType = ', userType);
    if (userType === 'seller') {
        return (
          <ShopManagement
          onBack={() => setshowShopManagement(false)}
          />
        );
    } else {
        return (
          <UserManagement
            onBack={() => setshowShopManagement(false)}
          />
        );
    }
  }

  // Shop type and subtype options
  const shopTypeOptions = {
    'Comida': ['Italiana', 'China', 'Peruana', 'Turca', 'Kebab', 'Pizza', 'Cafetería', 'Frutería', 'Carnicería', 'Panadería', 'Zapatería', 'Heladería', 'Pescadería', 'Otro'],
    'Ropa': ['Boutique', 'Tienda de Moda', 'Zapatería', 'Otro'],
    'Servicios': ['Peluquería', 'Taller', 'Consultoría', 'Inmobiliaria', 'Cultural','Bar', 'Otro']
  };

  // Render the login/registration form
  return (
    <div className={styles.container}>
        <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>
                {isLoggingIn ? 'INICIA SESIÓN' : 'CREA TU USUARIO'}
            </h2>
            
            <form onSubmit={(e) => handleFormSubmit(e)} 
            className={styles.formContent}>
                <div className={styles.formField}>
                    <label htmlFor="username">1. Escribe tu nombre de usuario</label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className={usernameError ? styles.inputError : ''}
                      required
                    />
                      {usernameError && <div className={styles.errorText}>{usernameError}</div>}
                      {ipError && <div className={styles.errorText}>{ipError}</div>}
                      {passwordError && <div className={styles.errorText}>{passwordError}</div>}
                </div>

                {!isLoggingIn && (
                  <div className={styles.formField}>
                      <div className={styles.radioOptions}>
                          <select 
                            value={userType} 
                            onChange={handleUserTypeChange}
                            required
                          >
                              <option value="">Tipo de usuario</option>
                              <option value="user">Cliente</option>
                              <option value="seller">Vendedor</option>
                              <option value="provider">Productor</option>
                          </select>
                      </div>
                  </div>
                )}

              {/* Additional fields for sellers */}
              {!isLoggingIn && userType === 'seller' && (
                <>
                  <div className={styles.formField}>
                    <label>Ubicación del usuario</label>
                    <input
                      type="text"
                      value={locationUser}
                      onChange={(e) => setLocationUser(e.target.value)}
                      placeholder="Ej: Ciudad, País"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Nombre de la tienda</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Nombre de tu negocio"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Ubicación de la tienda</label>
                    <input
                      type="text"
                      value={shopLocation}
                      onChange={(e) => setShopLocation(e.target.value)}
                      placeholder="Dirección de la tienda"
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Tipo de tienda</label>
                    <select
                      value={shopType}
                      onChange={(e) => {
                        setShopType(e.target.value);
                        setShopSubtype(''); // Reset subtype when type changes
                      }}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      {Object.keys(shopTypeOptions).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {shopType && (
                    <div className={styles.formField}>
                      <label>Subtipo de tienda</label>
                      <select
                        value={shopSubtype}
                        onChange={(e) => setShopSubtype(e.target.value)}
                        required
                      >
                        <option value="">Selecciona un subtipo</option>
                        {shopTypeOptions[shopType].map(subtype => (
                          <option key={subtype} value={subtype}>{subtype}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className={styles.formField}>
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

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={`${styles.submitButton} ${isButtonDisabled() ? styles.inactive : styles.active}`}
                  disabled={isButtonDisabled()}
                >
                  {isLoggingIn ? 'Entrar' : 'Crear cuenta'}
                </button>
                <button type="button" className={styles.toggleButton} onClick={toggleForm}>
                  {isLoggingIn ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </button>
              </div>
            </form>
        </div>
    </div>
  );
};

export default LoginRegisterForm;