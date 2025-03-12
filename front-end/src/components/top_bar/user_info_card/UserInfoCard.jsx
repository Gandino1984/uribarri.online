import React, { useContext, useEffect, useRef, useState } from 'react';
import { Camera, Loader, Eye } from 'lucide-react';
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
  
  // UPDATE: Add state for showing the action buttons
  const [showButtons, setShowButtons] = useState(false);
  
  // Reference to the profile container for positioning popup
  const profileContainerRef = useRef(null);
  
  // UPDATE: Toggle button visibility
  const toggleButtons = () => {
    if (!uploading) {
      setShowButtons(!showButtons);
    }
  };

  // UPDATE: Handle upload button click
  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowButtons(false);
  };

  // UPDATE: Handle view button click
  const handleViewClick = (e) => {
    e.stopPropagation();
    if (currentUser?.image_user) {
      const imageUrl = getImageUrl(currentUser.image_user);
      if (imageUrl) {
        setModalImageUrl(imageUrl);
        setIsImageModalOpen(true);
        setShowButtons(false);
      }
    }
  };

  // Close buttons popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const profileContainer = profileContainerRef.current;
      const popupMenu = document.getElementById('profile-actions-popup');
      
      // Check if click is outside both the profile container and popup menu
      if ((profileContainer && !profileContainer.contains(e.target)) && 
          (popupMenu && !popupMenu.contains(e.target)) && 
          showButtons) {
        setShowButtons(false);
      }
    };
    
    // Add the event listener after a short delay to prevent immediate closing
    // This helps with proper animation rendering
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showButtons]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            {/* UPDATE: External popup menu for actions */}
            {showButtons && (
              <div id="profile-actions-popup" className={styles.actionsPopup}>
                {/* Upload button */}
                <div className={styles.actionButton} onClick={handleUploadClick}>
                  <Camera size={16} className={styles.actionIcon} />
                  <span className={styles.actionText}>Subir Imagen</span>
                </div>
                
                {/* View button (only if there's an image) */}
                {currentUser?.image_user && (
                  <div className={styles.actionButton} onClick={handleViewClick}>
                    <Eye size={16} className={styles.actionIcon} />
                    <span className={styles.actionText}>Ver Imagen</span>
                  </div>
                )}
              </div>
            )}
            
            <div 
              ref={profileContainerRef}
              className={styles.profileImageContainer}
              onClick={toggleButtons}
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
              
              {/* UPDATE: Show the edit overlay with camera icon when hovering */}
              {!uploading && (
                <div className={styles.editOverlay}>
                  <Camera size={16} className={styles.editIcon} />
                  {/* <div className={styles.editText}>
                    Click for options
                  </div> */}
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
          {/* Welcome message */}
          <p className={styles.welcomeMessage}>{welcomeMessage}</p>
        </>
      )}
    </div>
  );
};

export default UserInfoCard;