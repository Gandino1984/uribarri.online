import React, { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { X, MessageCircleWarning, ExternalLink } from 'lucide-react';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../css/ConfirmationModal.module.css';

const ConfirmationModal = () => {
  const { 
    isModalOpen, 
    setIsModalOpen,
    modalMessage,
    modalConfirmCallback,
    setIsAccepted,
    setIsDeclined
  } = useUI();

  const overlayAnimation = useSpring({
    opacity: isModalOpen ? 1 : 0,
    config: { tension: 280, friction: 20 }
  });

  const modalAnimation = useSpring({
    opacity: isModalOpen ? 1 : 0,
    transform: isModalOpen ? 'translateY(0)' : 'translateY(-40px)',
    config: { mass: 0.6, tension: 280, friction: 26 }
  });

  const handleAccept = () => {
    setIsAccepted(true);
    setIsDeclined(false);
    setIsModalOpen(false);
    if (modalConfirmCallback && typeof modalConfirmCallback === 'function') {
      modalConfirmCallback(true);
    }
  };

  const handleDecline = () => {
    setIsDeclined(true);
    setIsAccepted(false);
    setIsModalOpen(false);
    if (modalConfirmCallback && typeof modalConfirmCallback === 'function') {
      modalConfirmCallback(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDecline();
    }
  };

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

  //update: Detect if message is about external navigation
  const isExternalLink = modalMessage && modalMessage.toLowerCase().includes('externo');

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
        <div className={styles.modalContent}>
          <div className={styles.warningIconContainer}>
            {isExternalLink ? (
              <ExternalLink 
                size={18}
                className={styles.warningIcon}
              />
            ) : (
              <MessageCircleWarning 
                size={18}
                className={styles.warningIcon}
              />
            )}
          </div>

          <div className={styles.messageContainer}>
            <h3 className={styles.title}>
              {isExternalLink ? '¿Continuar a sitio externo?' : '¿Estás seguro?'}
            </h3>
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
              {isExternalLink ? 'Ir al sitio' : 'Continuar'}
            </button>
          </div>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default ConfirmationModal;