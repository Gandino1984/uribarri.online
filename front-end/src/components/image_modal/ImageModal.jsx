import React, { useEffect, useState } from 'react';
import { useUI } from '../../app_context/UIContext.jsx';
import styles from './ImageModal.module.css';

const ImageModal = () => {
  // UPDATE: Using useUI hook to access image modal state
  const { 
    isImageModalOpen, 
    setIsImageModalOpen, 
    selectedImageForModal: imageUrl
  } = useUI();

  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Update image when modal opens/closes or imageUrl changes
  useEffect(() => {
    if (isImageModalOpen && imageUrl) {
      setIsLoading(true);
      setHasError(false);
      
      // Create a new Image object to preload
      const img = new Image();
      img.onload = () => {
        setCurrentImage(imageUrl);
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      img.src = imageUrl;
    } else {
      // Clear all states when modal closes
      setCurrentImage('');
      setIsLoading(false);
      setHasError(false);
    }

    // Cleanup function to reset states when component unmounts or updates
    return () => {
      if (!isImageModalOpen) {
        setCurrentImage('');
        setIsLoading(false);
        setHasError(false);
      }
    };
  }, [isImageModalOpen, imageUrl]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsImageModalOpen(false);
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen, setIsImageModalOpen]);

  if (!isImageModalOpen) return null;

  return (
    <div 
      className={styles.modalOverlay}
      onClick={() => setIsImageModalOpen(false)}
    >
      <div 
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={() => setIsImageModalOpen(false)}
          title="Cerrar"
        >
          ✕
        </button>
        {isLoading && (
          <div className={styles.loadingSpinner}>
            Loading...
          </div>
        )}
        {hasError && (
          <div className={styles.errorMessage}>
            Failed to load image
          </div>
        )}
        {!isLoading && !hasError && currentImage && (
          <img
            src={currentImage}
            alt="Modal image"
            className={styles.modalImage}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;