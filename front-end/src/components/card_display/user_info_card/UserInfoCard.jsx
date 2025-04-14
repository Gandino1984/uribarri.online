import React, { useEffect, useRef, useState, useContext } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Camera, Loader, Eye, User } from 'lucide-react';
import { useAuth } from '../../../app_context/AuthContext.jsx';
import { useUI } from '../../../app_context/UIContext.jsx';
import styles from '../../../../../public/css/UserInfoCard.module.css';
import { UserInfoCardUtils } from './UserInfoCardUtils.jsx';
import { TopBarStateContext } from '../../top_bar/TopBar.jsx';
import { userInfoCardAnimation } from '../../../utils/animation/transitions.js';

const UserInfoCard = () => {
  const { 
    currentUser 
  } = useAuth();
  
  const {
    uploading,
    setError,
    setInfo,
    setIsImageModalOpen,
    setSelectedImageForModal
  } = useUI();

  // Get TopBar expanded state from context
  const { isExpanded } = useContext(TopBarStateContext);

  const {
    handleImageUpload,
    getImageUrl,
    uploadProgress,
    localImageUrl
  } = UserInfoCardUtils();

  const fileInputRef = useRef(null);
  const [imageKey, setImageKey] = useState(Date.now()); 
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [hasValidImage, setHasValidImage] = useState(false);
  
  // State for showing the action buttons
  const [showButtons, setShowButtons] = useState(false);
  
  // References for positioning
  const profileContainerRef = useRef(null);
  const popupRef = useRef(null); // 🔍 UPDATE: Added ref for popup

  // Animation for profile section that maintains aspect ratio
  const profileSpring = useSpring({
    ...(isExpanded ? userInfoCardAnimation.expanded : userInfoCardAnimation.collapsed),
    config: userInfoCardAnimation.config
  });
  
  // Toggle button visibility
  const toggleButtons = () => {
    if (!uploading) {
      setShowButtons(!showButtons);
    }
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowButtons(false);
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (currentUser?.image_user && hasValidImage) {
      const imageUrl = getImageUrl(currentUser.image_user);
      if (imageUrl) {
        setSelectedImageForModal(imageUrl);
        setIsImageModalOpen(true);
        setShowButtons(false);
      }
    }
  };

  // 🔍 UPDATE: Position popup outside of TopBar if needed
  useEffect(() => {
    if (showButtons && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      
      // Check if popup is cut off at the bottom
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        popup.style.top = 'auto';
        popup.style.bottom = '100%';
        popup.style.marginTop = '0';
        popup.style.marginBottom = '0.5rem';
      }
      
      // Make sure popup is fully visible within viewport
      const viewportWidth = window.innerWidth;
      if (rect.right > viewportWidth) {
        popup.style.left = 'auto';
        popup.style.right = '0';
        popup.style.transform = 'none';
      } else if (rect.left < 0) {
        popup.style.left = '0';
        popup.style.transform = 'none';
      }
    }
  }, [showButtons]);

  // Check if user has a valid image on component mount and when currentUser changes
  useEffect(() => {
    const checkImage = async () => {
      if (currentUser?.image_user) {
        const imageUrl = getImageUrl(currentUser.image_user);
        if (imageUrl) {
          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageUrl;
            });
            setHasValidImage(true);
          } catch (error) {
            setHasValidImage(false);
          }
        } else {
          setHasValidImage(false);
        }
      } else {
        setHasValidImage(false);
      }
    };
    
    checkImage();
  }, [currentUser?.image_user, getImageUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const profileContainer = profileContainerRef.current;
      const popupMenu = document.getElementById('profile-actions-popup');
      
      if ((profileContainer && !profileContainer.contains(e.target)) && 
          (popupMenu && !popupMenu.contains(e.target)) && 
          showButtons) {
        setShowButtons(false);
      }
    };
    
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

  const getWelcomeMessage = () => {
    if (!currentUser) {
      return isSmallScreen ? 
        '¡Hola de nuevo!' : 
        '¡Hola de nuevo! Inicia sesión';
    }
    
    const userName = currentUser.name_user || 'usuario';
    
    // Conditionally display welcome message based on TopBar state
    if (isSmallScreen) {
      return <span className={styles.userName}>{userName}</span>;
    }
    
    return isExpanded ? 
      <>¡Hola de nuevo, <span className={styles.userName}>{userName}</span>!</> :
      <span className={styles.userName}>{userName}</span>;
  };

  return (
    <div className={`${styles.userInfoCard} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        {!currentUser ? (
            <div className={styles.message}>{getWelcomeMessage()}</div>
        ) : (
          <>
            <div className={styles.profileSection}>
                {/* 🔍 UPDATE: Added ref to popup and fixed positioning */}
                {showButtons && (
                  <div 
                    id="profile-actions-popup" 
                    className={styles.actionsPopup}
                    ref={popupRef}
                  >
                      {/* Upload button */}
                      <div className={styles.actionButton} onClick={handleUploadClick}>
                          <Camera size={16} className={styles.actionIcon} />
                          <span className={styles.actionText}>Subir Imagen</span>
                      </div>
                      
                      {/* View button (only if there's an image) */}
                      {hasValidImage && (
                      <div className={styles.actionButton} onClick={handleViewClick}>
                          <Eye size={16} className={styles.actionIcon} />
                          <span className={styles.actionText}>Ver Imagen</span>
                      </div>
                      )}
                  </div>
                )}
                
                {/* Wrap the profile container with an animated div */}
                <animated.div 
                  className={styles.profileWrapper}
                  style={profileSpring}
                >
                  <div 
                    ref={profileContainerRef}
                    className={styles.profileImageContainer}
                    onClick={toggleButtons}
                  >
                    {hasValidImage ? (
                      <img
                        key={imageKey}
                        src={getImageUrl(currentUser.image_user) || ''}
                        alt="Imagen de perfil"
                        className={styles.profileImage}
                        onError={() => {
                          setHasValidImage(false);
                          setInfo(prevInfo => ({
                            ...prevInfo,
                            imageInfo: "No tienes imagen de perfil"
                          }));
                        }}
                        onLoad={() => {
                          setHasValidImage(true);
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
                    ) : (
                      <div className={styles.placeholderImage}>
                        <User size={isExpanded ? 48 : 32} className={styles.placeholderIcon} />
                      </div>
                    )}
                    
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
                    
                    {/* Show the edit overlay with camera icon when hovering */}
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
                                >
                                </div>
                                <span className={styles.progressText}>
                                    {uploadProgress}%
                                </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </animated.div>
            </div>
            {/* Welcome message */}
            <p className={`${styles.welcomeMessage} ${isExpanded ? styles.expandedText : styles.collapsedText}`}>
              {getWelcomeMessage()}
            </p>
          </>
        )}
    </div>
  );
};

export default UserInfoCard;