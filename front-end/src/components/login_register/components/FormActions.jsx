//update: Added edit mode support with different buttons
import { DoorOpen, ChevronLeft, UserCheck, Save, X } from 'lucide-react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import { LoginRegisterUtils } from '../../login_register/LoginRegisterUtils.jsx';
import styles from '../../../../css/LoginRegisterForm.module.css';

export const FormActions = () => {
  const { isLoggingIn, setIsLoggingIn } = useAuth();
  const {
    isEditMode,
    setIsEditMode,
    setShowLandingPage,
    setShowTopBar,
    //update: Import state restoration functions
    preEditModeState,
    setShowShopManagement,
    setShowProductManagement,
    setShowShopWindow,
    setShowShopStore,
    setShowInfoManagement,
    setShowShopsListBySeller,
    setShowRiderManagement,
    setShowOffersBoard,
  } = useUI();

  const { handleFormSubmit, isButtonDisabled, toggleForm } = LoginRegisterUtils();

  //update: Handle cancel edit mode - restore previous navigation state
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsLoggingIn(true);

    //update: Restore previous navigation state if available
    if (preEditModeState) {
      setShowLandingPage(preEditModeState.showLandingPage);
      setShowTopBar(preEditModeState.showTopBar);
      setShowShopManagement(preEditModeState.showShopManagement);
      setShowProductManagement(preEditModeState.showProductManagement);
      setShowShopWindow(preEditModeState.showShopWindow);
      setShowShopStore(preEditModeState.showShopStore);
      setShowInfoManagement(preEditModeState.showInfoManagement);
      setShowShopsListBySeller(preEditModeState.showShopsListBySeller);
      setShowRiderManagement(preEditModeState.showRiderManagement);
      setShowOffersBoard(preEditModeState.showOffersBoard);
    } else {
      // Fallback if no previous state was saved
      setShowLandingPage(true);
      setShowTopBar(false);
    }
  };

  //update: Show different buttons based on mode
  if (isEditMode) {
    return (
      <div className={styles.formActions}>
        <button
          onClick={handleFormSubmit}
          type="button"
          title="Guardar cambios"
          className={`${styles.submitButton} ${isButtonDisabled() ? styles.inactive : styles.active}`}
          disabled={isButtonDisabled()}
        >
          <Save size={20} />
          Guardar cambios
        </button>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleCancelEdit}
          title="Cancelar edición"
        >
          <X size={20} />
          Cancelar
        </button>
      </div>
    );
  }

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