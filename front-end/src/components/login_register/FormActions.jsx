import React from 'react';
import { DoorOpen } from 'lucide-react';
import { LoginRegisterFunctions } from '../login_register/LoginRegisterFunctions.jsx';
import { useContext } from 'react';
import AppContext from '../../app_context/AppContext.js';
import styles from '../../../../public/css/LoginRegisterForm.module.css';

export const FormActions = () => {
  const { isLoggingIn } = useContext(AppContext);
  const { handleFormSubmit, isButtonDisabled, toggleForm } = LoginRegisterFunctions();

  return (
    <div className={styles.formActions}>
      <button
        onClick={handleFormSubmit}
        type="button"
        className={`${styles.submitButton} ${isButtonDisabled() ? styles.inactive : styles.active}`}
        disabled={isButtonDisabled()}
      >
        <DoorOpen size={16} />
        {isLoggingIn ? 'Entrar' : 'Crear cuenta'}
      </button>

      <button 
        type="button" 
        className={styles.toggleButton} 
        onClick={toggleForm}
      >
        {isLoggingIn ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
      </button>
    </div>
  );
};
