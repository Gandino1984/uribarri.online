import React, { useContext, useEffect, useRef, useState } from 'react';
import { Camera, Loader } from 'lucide-react';
import AppContext from '../../../app_context/AppContext.js';
import ImageModal from '../../image_modal/ImageModal.jsx';
import styles from '../../../../../public/css/UserInfoCard.module.css';
import { UserInfoCardFunctions } from './UserInfoCardFunctions.jsx';

const UserInfoCard = () => {
  const { 
    currentUser,
    uploading,
    setError
  } = useContext(AppContext);

  const {
    handleImageUpload,
    getImageUrl,
    uploadProgress,
    localImageUrl
  } = UserInfoCardFunctions();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [imageKey, setImageKey] = useState(Date.now()); 

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  // Reference for tracking click timing
  const clickRef = useRef({
    count: 0,
    timer: null,
    lastClickTime: 0
  });
  
  // Unified click handler with improved detection
  const handleImageClick = () => {
    // Do nothing if uploading or no user
    if (uploading || !currentUser) return;
    
    const now = Date.now();
    const timeSinceLastClick = now - clickRef.current.lastClickTime;
    clickRef.current.lastClickTime = now;
    
    // Check if this is a double click (clicks within 300ms of each other)
    if (timeSinceLastClick < 300) {
      // This is a double click - clear any pending timer
      if (clickRef.current.timer) {
        clearTimeout(clickRef.current.timer);
        clickRef.current.timer = null;
      }
      
      clickRef.current.count = 0; // Reset counter
      
      // Handle double click - open modal
      if (currentUser?.image_user) {
        const imageUrl = getImageUrl(currentUser.image_user);
        if (imageUrl) {
          setModalImageUrl(imageUrl);
          setIsImageModalOpen(true);
        }
      }
    } else {
      // This is a first click or clicks spaced far apart
      // Set a timer to handle as single click if no second click comes
      if (clickRef.current.timer) {
        clearTimeout(clickRef.current.timer);
      }
      
      clickRef.current.timer = setTimeout(() => {
        // This is a single click - open file selection
        console.log('Single click detected - opening file selector');
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        clickRef.current.count = 0;
        clickRef.current.timer = null;
      }, 300);
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (clickRef.current.timer) {
        clearTimeout(clickRef.current.timer);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force re-render when image path changes or local image is available
  useEffect(() => {
    if (currentUser?.image_user || localImageUrl) {
      setImageKey(Date.now());
    }
  }, [currentUser?.image_user, localImageUrl]);

  useEffect(() => {
    if (currentUser?.image_user) {
      const imageUrl = getImageUrl(currentUser.image_user);
      if (!imageUrl) {
        setError(prevError => ({ 
          ...prevError, 
          imageError: "No se ha proporcionado una ruta de imagen" 
        }));
      }
    }
  }, [currentUser?.image_user, getImageUrl, setError]);

  const handleModalClose = () => {
    setIsImageModalOpen(false);
    setModalImageUrl(null);
  };

  const welcomeMessage = isSmallScreen
    ? currentUser
      ? `${currentUser.name_user}`
      : '¡Bienvenida!'
    : currentUser
      ? `¡Te damos la bienvenida, ${currentUser.name_user || 'Usuaria'}!`
      : '¡Te damos la bienvenida! Inicia sesión';

  return (
    <div className={styles.userInfoCard}>
      {!currentUser ? (
        <div className={styles.message}>{welcomeMessage}</div>
      ) : (
        <>
          <div className={styles.profileSection}>
            <div 
              className={styles.profileImageContainer}
              onClick={handleImageClick}
            >
              {/* Profile image */}
              <img
                key={imageKey}
                src={getImageUrl(currentUser.image_user) || ''}
                alt="Imagen de perfil"
                className={styles.profileImage}
                onError={() => {
                  setError(prevError => ({ 
                    ...prevError, 
                    imageError: "No tienes imagen de perfil" 
                  }));
                }}
                onLoad={() => {
                  setError(prevError => ({
                    ...prevError,
                    imageError: ''
                  }));
                }}
              />
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="profile-image-input"
                disabled={uploading}
              />
              
              {/* Hover overlay - similar to ShopCoverImage */}
              {!uploading && (
                <div className={styles.editOverlay}>
                  <Camera size={16} className={styles.editIcon} />
                  <span className={styles.editText}>
                    {currentUser.image_user ? 'Cambiar foto' : 'Añadir foto'}
                  </span>
                </div>
              )}
              
              {/* Loader and progress bar during upload */}
              {uploading && (
                <div className={styles.loader}>
                  <Loader size={16} className={styles.loaderIcon} />
                  
                  {uploadProgress > 0 && (
                    <div className={styles.progressContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <span className={styles.progressText}>
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <ImageModal
              isOpen={isImageModalOpen}
              onClose={handleModalClose}
              imageUrl={modalImageUrl}
              altText={`Imagen de perfil de ${currentUser?.name_user}`}
            />
          </div>
          <p className={styles.welcomeMessage}>{welcomeMessage}</p>
        </>
      )}
    </div>
  );
};

export default UserInfoCard;