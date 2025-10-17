//update: Use UIContext for navigation, remove window.location.href
import { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';
import styles from '../../../css/ForgotPassword.module.css';

const ForgotPassword = () => {
  const { setShowForgotPassword, setShowLandingPage, setShowTopBar } = useUI();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const isEmailValid = emailRegex.test(email);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEmailValid) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axiosInstance.post('/user/request-password-reset', {
        email: email
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess(response.data.message || 'Se ha enviado un email con instrucciones para restablecer tu contraseña');
        setEmail('');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Error al solicitar el restablecimiento de contraseña. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  //update: Use UIContext navigation instead of window.location
  const handleBackToLogin = () => {
    console.log('Navigating back to landing page from ForgotPassword');
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, '/');
    
    setShowForgotPassword(false);
    setShowLandingPage(true);
    setShowTopBar(false);
  };
  
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
          <span>Volver</span>
        </button>
        
        <div className={styles.header}>
          <Mail size={48} className={styles.icon} />
          <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
          <p className={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className={`${styles.input} ${email && !isEmailValid ? styles.inputInvalid : ''} ${email && isEmailValid ? styles.inputValid : ''}`}
              disabled={isLoading}
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
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isEmailValid || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
          </button>
        </form>
      </div>
    </animated.div>
  ));
};

export default ForgotPassword;