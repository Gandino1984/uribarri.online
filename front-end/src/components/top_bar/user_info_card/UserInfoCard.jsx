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
    setError,
    setInfo
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

  // UPDATE: Simplified click handler to fix the repeated file dialog issue
  const handleImageClick = () => {
    // Do nothing if uploading or no user
    if (uploading || !currentUser) return;
    
    // For double-click (opening image modal)
    if (currentUser?.image_user) {
      // Open file selector on single click
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // If no image yet, always just open file selector
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };
  
  // UPDATE: Added separate handler for viewing the image in modal
  const handleImageDoubleClick = () => {
    if (uploading || !currentUser) return;
    
    if (currentUser?.image_user) {
      const imageUrl = getImageUrl(currentUser.image_user);
      if (imageUrl) {
        setModalImageUrl(imageUrl);
        setIsImageModalOpen(true);
      }
    }
  };

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

  // UPDATE: Improved welcome message handling for long usernames
  const welcomeMessage = isSmallScreen
    ? currentUser
      ? `${currentUser.name_user}`
      : '¡Hola de nuevo!'
    : currentUser
      ? `¡Hola de nuevo, ${currentUser.name_user || 'usuario'}!`
      : '¡Hola de nuevo! Inicia sesión';

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
              onDoubleClick={handleImageDoubleClick}
            >
              {/* Profile image */}
              <img
                key={imageKey}
                src={getImageUrl(currentUser.image_user) || ''}
                alt="Imagen de perfil"
                className={styles.profileImage}
                onError={() => {
                  setInfo(prevInfo => ({
                    ...prevInfo,
                    imageInfo: "No tienes imagen de perfil"
                  }));
                }}
                onLoad={() => {
                  setError(prevError => ({
                    ...prevError,
                    imageError: ''
                  }));
                  setInfo(prevInfo => ({
                    ...prevInfo,
                    imageInfo: ''
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
          {/* UPDATE: Added welcomeMessage class for better styling control */}
          <p className={styles.welcomeMessage}>{welcomeMessage}</p>
        </>
      )}
    </div>
  );
};

export default UserInfoCard;