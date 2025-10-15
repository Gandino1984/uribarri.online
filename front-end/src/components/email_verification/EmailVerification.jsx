// front-end/src/components/email_verification/EmailVerification.jsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Loader, RefreshCw } from 'lucide-react';
import axiosInstance from '../../utils/app/axiosConfig.js';
import styles from '../../../css/EmailVerification.module.css';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      if (!token || !email) {
        setVerificationStatus('error');
        setErrorMessage('Enlace de verificación inválido');
        return;
      }

      setUserEmail(email);

      try {
        const response = await axiosInstance.post('/user/verify-email', {
          email,
          token
        });

        if (response.data.error) {
          if (response.data.error.includes('expirado')) {
            setVerificationStatus('expired');
          } else {
            setVerificationStatus('error');
          }
          setErrorMessage(response.data.error);
        } else {
          setVerificationStatus('success');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setVerificationStatus('error');
        setErrorMessage('Error al verificar el email. Por favor intenta de nuevo.');
      }
    };

    verifyEmail();
  }, []);

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

  const handleNavigateToLogin = () => {
    // Remove query parameters and redirect to main page
    window.location.href = window.location.origin;
  };

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
            <button 
              className={styles.primaryButton}
              onClick={handleNavigateToLogin}
            >
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