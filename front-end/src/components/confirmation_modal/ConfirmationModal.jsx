import React, { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { X, MessageCircleWarning } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../../public/css/ConfirmationModal.module.css';

const ConfirmationModal = () => {
  // 🚀 UPDATE: Using consistent props from useUI hook
  const { 
    isModalOpen, 
    setIsModalOpen,
    modalMessage,
    modalConfirmCallback,
    setIsAccepted,
    setIsDeclined
  } = useUI();

  // 🚀 UPDATE: React Spring animations for modal
  const overlayAnimation = useSpring({
    opacity: isModalOpen ? 1 : 0,
    config: { tension: 280, friction: 20 }
  });

  const modalAnimation = useSpring({
    opacity: isModalOpen ? 1 : 0,
    transform: isModalOpen ? 'translateY(0)' : 'translateY(-40px)',
    config: { mass: 0.6, tension: 280, friction: 26 }
  });

  // 🚀 UPDATE: Updated handlers with explicit state management
  const handleAccept = () => {
    setIsAccepted(true);
    setIsDeclined(false);
    setIsModalOpen(false);
    // Call the callback function if it exists
    if (modalConfirmCallback && typeof modalConfirmCallback === 'function') {
      modalConfirmCallback(true);
    }
  };

  const handleDecline = () => {
    setIsDeclined(true);
    setIsAccepted(false);
    setIsModalOpen(false);
    // Call the callback function with false if it exists
    if (modalConfirmCallback && typeof modalConfirmCallback === 'function') {
      modalConfirmCallback(false);
    }
  };

  // Close modal if clicked outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDecline();
    }
  };

  // 🚀 UPDATE: Add keyboard support for ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleDecline();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <animated.div 
      className={styles.modalOverlay} 
      onClick={handleOverlayClick}
      style={overlayAnimation}
    >
      <animated.div 
        className={styles.modalContainer}
        style={modalAnimation}
      >
        <button
          onClick={handleDecline}
          className={styles.closeButton}
          aria-label="Close modal"
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
      </animated.div>
    </animated.div>
  );
};

export default ConfirmationModal;