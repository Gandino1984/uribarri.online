//update: Removed duplicate password display, using only NumericKeyboard's built-in display
import { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { Lock, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';
import NumericKeyboard from '../login_register/components/numeric_keyboard/NumericKeyboard.jsx';
import styles from '../../../css/ResetPassword.module.css';

const ResetPassword = () => {
  const { setShowResetPassword, setShowLandingPage, setShowTopBar } = useUI();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardKey, setKeyboardKey] = useState(0);
  
  //update: Read URL parameters directly
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const tokenParam = urlParams.get('token');
    
    console.log('ResetPassword - URL params:', { email: emailParam, token: tokenParam });
    
    if (emailParam && tokenParam) {
      setEmail(decodeURIComponent(emailParam));
      setToken(tokenParam);
    } else {
      setError('Enlace de restablecimiento inválido');
    }
  }, []);
  
  //update: Auto-transition to confirmation when first password is complete
  useEffect(() => {
    if (newPassword.length === 4 && !showConfirmPassword) {
      console.log('✓ First password complete (4 digits), auto-switching to confirmation step');
      setTimeout(() => {
        setShowConfirmPassword(true);
        setKeyboardKey(prev => prev + 1);
      }, 300);
    }
  }, [newPassword, showConfirmPassword]);
  
  //update: Accept newValue parameter to avoid React state timing issues
  const handlePasswordComplete = (newValue) => {
    if (newValue.length === 4 && !showConfirmPassword) {
      console.log('Password complete via callback');
      setShowConfirmPassword(true);
      setKeyboardKey(prev => prev + 1);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== SUBMIT PASSWORD RESET ===');
    console.log('newPassword length:', newPassword.length);
    console.log('confirmPassword length:', confirmPassword.length);
    console.log('Passwords match:', newPassword === confirmPassword);
    
    if (newPassword.length !== 4) {
      setError('La contraseña debe tener exactamente 4 dígitos');
      return;
    }
    
    if (confirmPassword.length !== 4) {
      setError('Debes confirmar tu contraseña');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Submitting password reset with:', { email, token: token.substring(0, 10) + '...' });
      
      const response = await axiosInstance.post('/user/reset-password', {
        email: email,
        token: token,
        newPassword: newPassword
      });
      
      console.log('Password reset response:', response.data);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess(response.data.message || 'Contraseña restablecida exitosamente');
        setTimeout(() => {
          handleBackToLogin();
        }, 2000);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al restablecer la contraseña. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    console.log('Navigating back to landing page from ResetPassword');
    window.history.replaceState({}, document.title, '/');
    setShowResetPassword(false);
    setShowLandingPage(true);
    setShowTopBar(false);
  };
  
  const isSubmitEnabled = newPassword.length === 4 && 
                          confirmPassword.length === 4 && 
                          newPassword === confirmPassword && 
                          !isLoading;
  
  const transitions = useTransition(true, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 20 },
  });
  
  return transitions((style) => (
    <animated.div className={styles.container} style={style}>
      <div className={styles.formContainer}>
        <button 
          onClick={handleBackToLogin}
          className={styles.backButton}
          type="button"
        >
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </button>
        
        <div className={styles.header}>
          <Lock size={48} className={styles.icon} />
          <h1 className={styles.title}>Restablece tu contraseña</h1>
          <p className={styles.subtitle}>
            Ingresa tu nueva contraseña de 4 dígitos
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.passwordSection}>
            {/*update: Label showing current step*/}
            {!showConfirmPassword && newPassword.length < 4 && (
              <label className={styles.label}>Nueva contraseña:</label>
            )}
            
            {showConfirmPassword && confirmPassword.length < 4 && (
              <label className={styles.label}>Confirma tu nueva contraseña:</label>
            )}
            
            {/*update: REMOVED duplicate password display - NumericKeyboard handles it*/}
            <NumericKeyboard
              key={keyboardKey}
              value={showConfirmPassword ? confirmPassword : newPassword}
              onChange={showConfirmPassword ? setConfirmPassword : setNewPassword}
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
          
          {/*update: Submit button visible when on confirmation step*/}
          {showConfirmPassword && (
            <>
              <button
                type="submit"
                className={`${styles.submitButton} ${!isSubmitEnabled ? styles.submitButtonDisabled : ''}`}
                disabled={!isSubmitEnabled}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Restableciendo...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Restablecer contraseña
                  </>
                )}
              </button>
              
              {/*update: Feedback messages*/}
              {confirmPassword.length < 4 && (
                <p className={styles.helperText}>
                  Ingresa los 4 dígitos de confirmación ({4 - confirmPassword.length} restantes)
                </p>
              )}
              
              {confirmPassword.length === 4 && newPassword !== confirmPassword && (
                <p className={styles.helperText}>
                  ⚠️ Las contraseñas no coinciden
                </p>
              )}
              
              {confirmPassword.length === 4 && newPassword === confirmPassword && (
                <p className={styles.helperTextSuccess}>
                  ✓ ¡Perfecto! Haz clic en "Restablecer contraseña"
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </animated.div>
  ));
};

export default ResetPassword;