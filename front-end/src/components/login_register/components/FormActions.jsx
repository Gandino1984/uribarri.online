// import React from 'react';
import { DoorOpen, ChevronLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx'; 
import styles from '../../../../public/css/LoginRegisterForm.module.css';

export const FormActions = () => {
  // UPDATE: Using useAuth hook instead of AppContext
  const { isLoggingIn } = useAuth();
  
  const { handleFormSubmit, isButtonDisabled, toggleForm } = LoginRegisterUtils();

  return (
    <div className={styles.formActions}>
      <button
        onClick={handleFormSubmit}
        type="button"
        title="Iniciar sesión"
        className={`${styles.submitButton} ${isButtonDisabled() ? styles.inactive : styles.active}`}
        disabled={isButtonDisabled()}
      >
        <UserCheck size={20} />
        {isLoggingIn ? 'Entrar' : 'Crear cuenta'}
      </button>

      <button 
        type="button" 
        className={styles.toggleButton} 
        onClick={toggleForm}    
        title="Crea una cuenta"
      >
        <ChevronLeft size={20} />
        {isLoggingIn ? 'Registrarme' : 'Volver'}
      </button>
    </div>
  );
};