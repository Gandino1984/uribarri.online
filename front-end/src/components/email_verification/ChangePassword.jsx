//update: New component for logged-in users to change password
import { useState } from 'react';
import { X, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';
import NumericKeyboard from '../login_register/components/numeric_keyboard/NumericKeyboard.jsx';
import styles from '../../../css/ChangePassword.module.css';

const ChangePassword = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState('old'); // 'old', 'new', 'confirm'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keyboardKey, setKeyboardKey] = useState(0);
  
  if (!isOpen) return null;
  
  const handlePasswordComplete = () => {
    if (currentStep === 'old' && oldPassword.length === 4) {
      setCurrentStep('new');
      setKeyboardKey(prev => prev + 1);
    } else if (currentStep === 'new' && newPassword.length === 4) {
      setCurrentStep('confirm');
      setKeyboardKey(prev => prev + 1);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (oldPassword.length !== 4 || newPassword.length !== 4 || confirmPassword.length !== 4) {
      setError('Todas las contraseñas deben tener exactamente 4 dígitos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    
    if (oldPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/user/change-password', {
        id_user: currentUser.id_user,
        oldPassword: oldPassword,
        newPassword: newPassword
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess(response.data.message || 'Contraseña cambiada exitosamente');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Error al cambiar la contraseña. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentStep('old');
    setError('');
    setSuccess('');
    setKeyboardKey(0);
    onClose();
  };
  
  const getCurrentPassword = () => {
    switch (currentStep) {
      case 'old': return oldPassword;
      case 'new': return newPassword;
      case 'confirm': return confirmPassword;
      default: return '';
    }
  };
  
  const handlePasswordChange = (value) => {
    switch (currentStep) {
      case 'old': setOldPassword(value); break;
      case 'new': setNewPassword(value); break;
      case 'confirm': setConfirmPassword(value); break;
    }
  };
  
  const getStepLabel = () => {
    switch (currentStep) {
      case 'old': return 'Contraseña actual:';
      case 'new': return 'Nueva contraseña:';
      case 'confirm': return 'Confirma nueva contraseña:';
      default: return '';
    }
  };
  
  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={handleClose}
          className={styles.closeButton}
          type="button"
        >
          <X size={24} />
        </button>
        
        <div className={styles.header}>
          <Lock size={40} className={styles.icon} />
          <h2 className={styles.title}>Cambiar contraseña</h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${currentStep === 'old' ? styles.active : ''} ${oldPassword.length === 4 ? styles.completed : ''}`}>1</div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${currentStep === 'new' ? styles.active : ''} ${newPassword.length === 4 ? styles.completed : ''}`}>2</div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${currentStep === 'confirm' ? styles.active : ''} ${confirmPassword.length === 4 ? styles.completed : ''}`}>3</div>
          </div>
          
          <div className={styles.passwordSection}>
            <label className={styles.label}>{getStepLabel()}</label>
            
            <div className={styles.passwordDisplay}>
              {'*'.repeat(getCurrentPassword().length)}
            </div>
            
            <NumericKeyboard
              key={keyboardKey}
              value={getCurrentPassword()}
              onChange={handlePasswordChange}
              onPasswordComplete={handlePasswordComplete}
              error={!!error}
            />
          </div>
          
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className={styles.successMessage}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}
          
          {currentStep === 'confirm' && confirmPassword.length === 4 && (
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;