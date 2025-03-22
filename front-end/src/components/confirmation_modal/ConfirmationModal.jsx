import React from 'react';
import { X, MessageCircleWarning } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../../public/css/ConfirmationModal.module.css';

const ConfirmationModal = () => {
  // UPDATE: Using useUI hooxk instead of AppContext
  const { 
    isModalOpen, 
    setIsModalOpen,
    setIsAccepted,
    setIsDeclined,
    modalMessage,
  } = useUI();

  const handleAccept = () => {
    setIsAccepted(true);
    setIsDeclined(false);
    setIsModalOpen(false);
  };

  const handleDecline = () => {
    setIsDeclined(true);
    setIsAccepted(false);
    setIsModalOpen(false);
  };

  // Close modal if clicked outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDecline();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer}>
        <button
          onClick={handleDecline}
          className={styles.closeButton}
        >
          <X size={20} />
        </button>

        <div className={styles.modalContent}>
          <div className={styles.warningIconContainer}>
            <MessageCircleWarning 
              size={18}
              className={styles.warningIcon}
            />
          </div>

          <div className={styles.messageContainer}>
            <h3 className={styles.title}>¿Estás seguro?</h3>
            <p className={styles.message}>
              {modalMessage || 'Esta acción no se puede deshacer.'}
            </p>
          </div>

          <div className={styles.buttonContainer}>
            <button
              onClick={handleDecline}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              className={styles.continueButton}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;