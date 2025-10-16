//update: Use state-based navigation instead of React Router
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Loader, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/app/axiosConfig.js';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../css/EmailVerification.module.css';

const EmailVerification = () => {
  //update: Get state from UIContext
  const { 
    showEmailVerification, 
    setShowEmailVerification,
    setShowLandingPage,
    setShowTopBar
  } = useUI();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [verifiedUserTypes, setVerifiedUserTypes] = useState([]);

  useEffect(() => {
    //update: Only run verification if this component should be shown
    if (!showEmailVerification) return;

    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      console.log('EmailVerification - Verifying with:', { token, email });

      if (!token || !email) {
        setVerificationStatus('error');
        setErrorMessage('Enlace de verificación inválido');
        return;
      }

      setUserEmail(decodeURIComponent(email));

      try {
        const response = await axiosInstance.post('/user/verify-email', {
          email: decodeURIComponent(email),
          token: token
        });

        console.log('Verification response:', response.data);

        if (response.data.error) {
          if (response.data.error.includes('expirado') || response.data.error.includes('expired')) {
            setVerificationStatus('expired');
          } else {
            setVerificationStatus('error');
          }
          setErrorMessage(response.data.error);
        } else {
          setVerificationStatus('success');
          if (response.data.data?.user_types) {
            setVerifiedUserTypes(response.data.data.user_types);
          }
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setVerificationStatus('error');
        
        if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else if (error.message === 'Network Error') {
          setErrorMessage('Error de conexión. Por favor verifica tu conexión a internet.');
        } else {
          setErrorMessage('Error al verificar el email. Por favor intenta de nuevo.');
        }
      }
    };

    verifyEmail();
  }, [showEmailVerification]);

  const handleResendVerification = async () => {
    if (!userEmail || isResending) return;

    setIsResending(true);
    try {
      const response = await axiosInstance.post('/user/resend-verification', {
        email: userEmail
      });

      if (response.data.error) {
        setErrorMessage(response.data.error);
      } else {
        setVerificationStatus('resent');
        setTimeout(() => {
          setVerificationStatus('expired');
        }, 5000);
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setErrorMessage('Error al reenviar el email de verificación');
    } finally {
      setIsResending(false);
    }
  };

  //update: Navigate back to landing page using state
  const handleNavigateToLogin = () => {
    console.log('Navigating back to landing page');
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Reset states to show landing page
    setShowEmailVerification(false);
    setShowLandingPage(true);
    setShowTopBar(false);
  };

  const formatUserType = (type) => {
    const typeNames = {
      'user': '👤 Usuario',
      'seller': '🏪 Vendedor',
      'rider': '🚴 Repartidor',
      'provider': '📦 Proveedor'
    };
    return typeNames[type] || type;
  };

  //update: Don't render if this component shouldn't be shown
  if (!showEmailVerification) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {verificationStatus === 'verifying' && (
          <>
            <div className={styles.iconWrapper}>
              <Loader className={styles.loadingIcon} size={64} />
            </div>
            <h2 className={styles.title}>Verificando tu email...</h2>
            <p className={styles.message}>Por favor espera mientras verificamos tu dirección de correo electrónico.</p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className={styles.iconWrapper}>
              <CheckCircle className={styles.successIcon} size={64} />
            </div>
            <h2 className={styles.title}>¡Email Verificado!</h2>
            <p className={styles.message}>
              Tu dirección de correo electrónico ha sido verificada exitosamente.
              Ya puedes iniciar sesión en tu cuenta.
            </p>
            
            {verifiedUserTypes.length > 0 && (
              <div className={styles.accountsBox}>
                <p className={styles.accountsTitle}>
                  {verifiedUserTypes.length > 1 ? 'Cuentas verificadas:' : 'Cuenta verificada:'}
                </p>
                <ul className={styles.accountsList}>
                  {verifiedUserTypes.map((type, index) => (
                    <li key={index} className={styles.accountItem}>
                      {formatUserType(type)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button 
              className={styles.primaryButton}
              onClick={handleNavigateToLogin}
            >
              <Mail size={20} />
              Ir a Iniciar Sesión
            </button>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className={styles.iconWrapper}>
              <XCircle className={styles.errorIcon} size={64} />
            </div>
            <h2 className={styles.title}>Error de Verificación</h2>
            <p className={styles.message}>{errorMessage || 'Hubo un problema al verificar tu email.'}</p>
            <button 
              className={styles.primaryButton}
              onClick={handleNavigateToLogin}
            >
              Volver al Inicio
            </button>
          </>
        )}

        {verificationStatus === 'expired' && (
          <>
            <div className={styles.iconWrapper}>
              <Mail className={styles.warningIcon} size={64} />
            </div>
            <h2 className={styles.title}>Enlace Expirado</h2>
            <p className={styles.message}>
              Este enlace de verificación ha expirado. 
              Puedes solicitar un nuevo enlace de verificación.
            </p>
            <button 
              className={styles.primaryButton}
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader className={styles.buttonLoadingIcon} size={16} />
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Reenviar Email de Verificación
                </>
              )}
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={handleNavigateToLogin}
            >
              Volver al Inicio
            </button>
          </>
        )}

        {verificationStatus === 'resent' && (
          <>
            <div className={styles.iconWrapper}>
              <Mail className={styles.successIcon} size={64} />
            </div>
            <h2 className={styles.title}>Email Reenviado</h2>
            <p className={styles.message}>
              Se ha enviado un nuevo enlace de verificación a {userEmail}.
              Por favor revisa tu bandeja de entrada.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;