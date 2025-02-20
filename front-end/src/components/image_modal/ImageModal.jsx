import React, { useEffect, useState } from 'react';
import styles from './ImageModal.module.css';

const ImageModal = ({ isOpen, onClose, imageUrl, altText }) => {
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Update image when modal opens/closes or imageUrl changes
  useEffect(() => {
    if (isOpen && imageUrl) {
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
      if (!isOpen) {
        setCurrentImage('');
        setIsLoading(false);
        setHasError(false);
      }
    };
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div 
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
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
            alt={altText || 'Modal image'}
            className={styles.modalImage}
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;