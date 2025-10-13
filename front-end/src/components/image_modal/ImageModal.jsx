import { useEffect, useState } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from '../../../public/css/ImageModal.module.css'; 
import { Loader } from 'lucide-react';

const ImageModal = () => {
  const { 
    showImageModal,
    setShowImageModal,
    modalImageSrc
  } = useUI();

  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (showImageModal) {
      console.log('ImageModal opened with URL:', modalImageSrc);
    }
  }, [showImageModal, modalImageSrc]);

  // Update image when modal opens/closes or imageUrl changes
  useEffect(() => {
    if (showImageModal && modalImageSrc) {
      setIsLoading(true);
      setHasError(false);
      
      // Create a new Image object to preload
      const img = new Image();
      img.onload = () => {
        setCurrentImage(modalImageSrc);
        setIsLoading(false);
        console.log('Image loaded successfully:', modalImageSrc);
      };
      img.onerror = (e) => {
        console.error('Failed to load image:', e);
        setHasError(true);
        setIsLoading(false);
      };
      img.src = modalImageSrc;
    } else {
      // Clear all states when modal closes
      setCurrentImage('');
      setIsLoading(false);
      setHasError(false);
    }

    // Cleanup function to reset states when component unmounts or updates
    return () => {
      if (!showImageModal) {
        setCurrentImage('');
        setIsLoading(false);
        setHasError(false);
      }
    };
  }, [showImageModal, modalImageSrc]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal, setShowImageModal]);

  if (!showImageModal || !modalImageSrc) return null;

  return (
    <div 
      className={styles.modalOverlay}
      onClick={() => setShowImageModal(false)}
    >
      <div 
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={() => setShowImageModal(false)}
          title="Cerrar"
        >
          ✕
        </button>
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <Loader size={24} className="animate-spin" />
            <span style={{ marginLeft: '0.5rem' }}>Cargando...</span>
          </div>
        )}
        {hasError && (
          <div className={styles.errorMessage}>
            Error al cargar la imagen
          </div>
        )}
        {!isLoading && !hasError && currentImage && (
          <img
            src={currentImage}
            alt="Imagen de perfil"
            className={styles.modalImage}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;