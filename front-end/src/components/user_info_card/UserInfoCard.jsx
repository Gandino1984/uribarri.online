import { useEffect, useRef, useState } from 'react';
import { Camera, Loader, Eye, User, CircleUserRound,  X } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../../public/css/UserInfoCard.module.css';
import { UserInfoCardUtils } from './UserInfoCardUtils.jsx';

const UserInfoCard = ({ onClose }) => {
  const { 
    currentUser 
  } = useAuth();
  
  const {
    uploading,
    setError,
    setInfo,
    openImageModal,
  } = useUI();

  const {
    handleImageUpload,
    getImageUrl,
    uploadProgress,
    localImageUrl
  } = UserInfoCardUtils();

  const fileInputRef = useRef(null);
  const [imageKey, setImageKey] = useState(Date.now()); 
  const [hasValidImage, setHasValidImage] = useState(false);
  
  //update: State for controlling visibility
  const [isVisible, setIsVisible] = useState(false);
  
  // State for showing the action buttons
  const [showButtons, setShowButtons] = useState(false);
  
  // References for positioning
  const profileContainerRef = useRef(null);
  const popupRef = useRef(null);

  //update: Fixed slide-down animation with proper centering
  const slideAnimation = useSpring({
    from: {
      opacity: 0,
      transform: 'translate(-50%, -150%)', // Start above screen, centered
    },
    to: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(-50%, 0%)' : 'translate(-50%, -150%)', // Maintain centering
    },
    config: {
      mass: 1,
      tension: 180,
      friction: 20
    }
  });
  
  //update: Backdrop fade animation
  const backdropAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
    config: {
      duration: 200
    }
  });

  //update: Show animation when component mounts
  useEffect(() => {
    // Small delay to ensure proper mounting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  //update: Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

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
        console.log('Opening image modal with URL:', imageUrl);
        openImageModal(imageUrl);
        setShowButtons(false);
      } else {
        console.error('No valid image URL obtained from getImageUrl');
      }
    } else {
      console.error('No valid image available to view');
    }
  };

  //update: Improved popup positioning
  useEffect(() => {
    if (showButtons && popupRef.current && profileContainerRef.current) {
      const popup = popupRef.current;
      const profileContainer = profileContainerRef.current;
      const profileRect = profileContainer.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      
      // Reset any inline styles first
      popup.style.top = '';
      popup.style.bottom = '';
      popup.style.left = '';
      popup.style.right = '';
      
      // Check if popup would go off the bottom of the screen
      const spaceBelow = window.innerHeight - profileRect.bottom;
      const spaceAbove = profileRect.top;
      
      if (popupRect.height > spaceBelow && spaceAbove > spaceBelow) {
        // Position above the profile image
        popup.style.bottom = 'calc(100% + 0.5rem)';
        popup.style.top = 'auto';
      }
      
      // Check horizontal positioning
      const spaceRight = window.innerWidth - profileRect.left;
      
      if (popupRect.width > spaceRight) {
        // Align to right edge if not enough space
        popup.style.left = 'auto';
        popup.style.right = '0';
      }
    }
  }, [showButtons]);
  
  // Check if user has a valid image
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
            console.error('Error loading image:', error);
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

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* update: Backdrop with fade animation */}
      <animated.div 
        className={styles.backdrop}
        style={backdropAnimation}
        onClick={handleClose}
      />
      
      {/* update: Card with fixed slide-down animation and centering */}
      <animated.div 
        className={styles.userInfoCard}
        style={slideAnimation}
      >
        {/* update: Close button */}
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        
        <div className={styles.cardContent}>
          <div className={styles.profileSection}>
            {/* Profile image container */}
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
                  <CircleUserRound size={40} className={styles.placeholderIcon} />
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
                  <Camera size={20} className={styles.editIcon} />
                </div>
              )}
              
              {/* Loader and progress bar during upload */}
              {uploading && (
                <div className={styles.loader}>
                  <Loader size={20} className={styles.loaderIcon} />
                  
                  {uploadProgress > 0 && (
                    <div className={styles.progressContainer}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${uploadProgress}%` }}
                      />
                      <span className={styles.progressText}>
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Popup for profile actions */}
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
          </div>
          
          {/* User info section */}
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>
              {currentUser.name_user || 'Usuario'}
            </h2>
            <p className={styles.userType}>
              {currentUser.type_user === 'seller' ? 'Vendedor/a' : 
               currentUser.type_user === 'rider' ? 'Repartidor/a' : 
               currentUser.type_user === 'buyer' ? 'Comprador/a' : 
               currentUser.type_user}
            </p>
            {currentUser.email_user && (
              <p className={styles.userEmail}>
                {currentUser.email_user}
              </p>
            )}
          </div>
        </div>
      </animated.div>
    </>
  );
};

export default UserInfoCard;