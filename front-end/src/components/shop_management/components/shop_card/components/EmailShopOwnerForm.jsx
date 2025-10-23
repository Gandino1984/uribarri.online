import { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../../../../../app_context/AuthContext.jsx';
import axiosInstance from '../../../../../utils/app/axiosConfig.js';
import styles from '../../../../../../css/EmailShopOwnerForm.module.css';

const EmailShopOwnerForm = ({ isOpen, onClose, shopOwnerEmail, shopName }) => {
  const { currentUser } = useAuth();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return;
    }

    if (message.length > 500) {
      setError('El mensaje no puede exceder 500 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/user/contact-shop-owner', {
        senderName: currentUser.name_user,
        senderEmail: currentUser.email_user,
        recipientEmail: shopOwnerEmail,
        shopName: shopName,
        message: message.trim(),
        subject: subject.trim() || undefined
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess(response.data.message || 'Mensaje enviado correctamente');
        setMessage('');
        setSubject('');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error sending contact email:', err);
      setError('Error al enviar el mensaje. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSubject('');
    setError('');
    setSuccess('');
    onClose();
  };

  const remainingChars = 500 - message.length;

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
          <Mail size={40} className={styles.icon} />
          <h2 className={styles.title}>Contactar con {shopName}</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.userInfo}>
            <p><strong>De:</strong> {currentUser.name_user}</p>
            <p><strong>Email:</strong> {currentUser.email_user}</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Asunto (opcional)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Consulta sobre productos"
              className={styles.input}
              maxLength={100}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className={styles.textarea}
              rows={6}
              maxLength={500}
              required
            />
            <div className={`${styles.charCount} ${remainingChars < 50 ? styles.warning : ''}`}>
              {remainingChars} caracteres restantes
            </div>
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
            disabled={isLoading || message.trim().length < 10}
          >
            {isLoading ? (
              'Enviando...'
            ) : (
              <>
                <Send size={18} />
                Enviar Mensaje
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailShopOwnerForm;
