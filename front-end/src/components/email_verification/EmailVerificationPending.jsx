// front-end/src/components/email_verification/EmailVerificationPending.jsx

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/app/axiosConfig.js';
import styles from '../../../public/css/EmailVerificationPending.module.css';

const EmailVerificationPending = ({ email, onBackToLogin }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(''); // '', 'success', 'error'
  const [resendMessage, setResendMessage] = useState('');

  const handleResendVerification = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendStatus('');
    setResendMessage('');

    try {
      const response = await axiosInstance.post('/user/resend-verification', {
        email: email
      });

      if (response.data.error) {
        setResendStatus('error');
        setResendMessage(response.data.error);
      } else {
        setResendStatus('success');
        setResendMessage('Email de verificación reenviado exitosamente');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setResendStatus('error');
      setResendMessage('Error al reenviar el email de verificación');
    } finally {
      setIsResending(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setResendStatus('');
        setResendMessage('');
      }, 5000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <Mail className={styles.mailIcon} size={64} />
          <div className={styles.checkIconWrapper}>
            <CheckCircle className={styles.checkIcon} size={24} />
          </div>
        </div>

        <h2 className={styles.title}>¡Registro Exitoso!</h2>
        
        <div className={styles.content}>
          <p className={styles.mainMessage}>
            Tu cuenta ha sido creada exitosamente.
          </p>
          
          <div className={styles.emailBox}>
            <p className={styles.emailText}>
              Hemos enviado un correo de verificación a:
            </p>
            <p className={styles.emailAddress}>{email}</p>
          </div>

          <div className={styles.instructions}>
            <h3 className={styles.instructionsTitle}>Próximos pasos:</h3>
            <ol className={styles.instructionsList}>
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca el correo de Uribarri.Online</li>
              <li>Haz clic en el enlace de verificación</li>
              <li>Inicia sesión con tu cuenta verificada</li>
            </ol>
          </div>

          <div className={styles.warningBox}>
            <AlertCircle size={20} className={styles.warningIcon} />
            <p className={styles.warningText}>
              <strong>Importante:</strong> No podrás iniciar sesión hasta que verifiques tu correo electrónico.
              El enlace de verificación expirará en 24 horas.
            </p>
          </div>

          {resendStatus && (
            <div className={`${styles.messageBox} ${resendStatus === 'success' ? styles.successBox : styles.errorBox}`}>
              <p className={styles.messageText}>{resendMessage}</p>
            </div>
          )}

          <div className={styles.actions}>
            <button 
              className={styles.resendButton}
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className={styles.spinningIcon} size={16} />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Reenviar Email
                </>
              )}
            </button>

            <button 
              className={styles.backButton}
              onClick={onBackToLogin}
            >
              <ArrowLeft size={16} />
              Volver al Inicio
            </button>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;