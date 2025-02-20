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
    getImageUrl
  } = UserInfoCardFunctions();

  const [showUploadButton, setShowUploadButton] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  }, [currentUser?.image_user, setError]);

  const handleImageSingleClick = () => {
    setShowUploadButton(prev => !prev);
  };

  const handleImageDoubleClick = () => {
    if (currentUser?.image_user) {
      const imageUrl = getImageUrl(currentUser.image_user);
      if (imageUrl) {
        setModalImageUrl(imageUrl);
        setIsImageModalOpen(true);
      }
    }
  };

  const handleModalClose = () => {
    setIsImageModalOpen(false);
    setModalImageUrl(null);
  };

  const handleUploadButtonClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowUploadButton(false);
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
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={handleImageSingleClick}
              onDoubleClick={handleImageDoubleClick}
            >
              <img
                src={getImageUrl(currentUser.image_user) || ''}
                alt="Click aquí"
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
              {showUploadButton && (
                <label 
                  htmlFor="profile-image-input"
                  className={styles.uploadButton}
                  style={{ 
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    cursor: uploading ? 'wait' : 'pointer',
                  }}
                  onClick={handleUploadButtonClick}
                >
                  <Camera size={16} />
                </label>
              )}
            </div>
            <ImageModal
              isOpen={isImageModalOpen}
              onClose={handleModalClose}
              imageUrl={modalImageUrl}
              altText={`Full size image of ${currentUser?.name_user}`}
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="profile-image-input"
              disabled={uploading}
              ref={fileInputRef}
            />
          </div>
          <p className={styles.welcomeMessage}>{welcomeMessage}</p>
          {uploading && <Loader size={16} />}
        </>
      )}
    </div>
  );
};

export default UserInfoCard;