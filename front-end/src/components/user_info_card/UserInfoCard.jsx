import { useEffect, useRef, useState } from 'react';
import { Camera, Loader, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../../public/css/UserInfoCard.module.css';
import { UserInfoCardUtils } from './UserInfoCardUtils.jsx';


const UserInfoCard = () => {
  const { 
    currentUser 
  } = useAuth();
  
  const {
    uploading,
    setError,
    setInfo,
    openImageModal,
    isCardMinimized, 
    setIsCardMinimized
  } = useUI();

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
  // State for showing the toggle icon on hover
  const [showToggleIcon, setShowToggleIcon] = useState(false);
  
  // References for positioning
  const profileContainerRef = useRef(null);
  const popupRef = useRef(null);
  const cardRef = useRef(null);

  // 🚀 UPDATE: Adjusted spring animation values to ensure username displays completely
  const cardAnimation = useSpring({
    width: isCardMinimized ? (isSmallScreen ? 80 : 90) : (isSmallScreen ? 200 : 240),
    paddingRight: isCardMinimized ? (isSmallScreen ? 10 : 12) : (isSmallScreen ? 15 : 20),
    paddingLeft: isCardMinimized ? (isSmallScreen ? 15 : 20) : (isSmallScreen ? 35 : 45),
    paddingTop: isSmallScreen ? 6 : 8,
    paddingBottom: isSmallScreen ? 6 : 6,
    config: {
      mass: .5,
      tension: 200,
      friction: 10
    }
  });

  // Toggle minimized state
  const toggleMinimized = (e) => {
    e.stopPropagation(); // Prevent other click handlers from firing
    setIsCardMinimized(!isCardMinimized);
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

  // 🔧 UPDATE: Improved popup positioning to ensure visibility
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

  // 🚀 UPDATE: Improved responsive behavior with dynamic width calculations
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
      
      // Force card to check if name fits and adjust if needed
      if (cardRef.current && !isCardMinimized) {
        const welcomeTextElement = cardRef.current.querySelector(`.${styles.welcomeMessage}`);
        if (welcomeTextElement) {
          const textWidth = welcomeTextElement.scrollWidth;
          const containerWidth = cardRef.current.clientWidth - 60; // Account for padding and image
          
          if (textWidth > containerWidth) {
            cardAnimation.width.set(textWidth + 90); // Add extra space for the profile image and padding
          }
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Run once on mount
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isCardMinimized, cardAnimation.width]);

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

  // Add mouse enter/leave handlers for the card
  const handleMouseEnter = () => {
    setShowToggleIcon(true);
  };

  const handleMouseLeave = () => {
    setShowToggleIcon(false);
  };

  // 🎯 UPDATE: Improved welcome message function to ensure name is displayed fully
  const getWelcomeMessage = () => {
    if (!currentUser) return null;
    
    const userName = currentUser.name_user || 'usuario';
    
    if (isSmallScreen) {
      return <span className={styles.userName}>{userName}</span>;
    }
    
    return (
      <>¡Hola, <span className={styles.userName}>{userName}</span>!</>
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <animated.div 
      className={`${styles.userInfoCard} ${isCardMinimized ? styles.minimized : ''}`}
      style={cardAnimation}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.profileSection}>
        {/* Popup for profile actions */}
        {showButtons && !isCardMinimized && (
          <div 
            id="profile-actions-popup" 
            className={styles.actionsPopup}
            ref={popupRef}
          >
            {/* Upload button */}
            <div className={styles.actionButton} onClick={handleUploadClick}>
              <Camera size={14} className={styles.actionIcon} />
              <span className={styles.actionText}>Subir Imagen</span>
            </div>
            
            {/* View button (only if there's an image) */}
            {hasValidImage && (
            <div className={styles.actionButton} onClick={handleViewClick}>
              <Eye size={14} className={styles.actionIcon} />
              <span className={styles.actionText}>Ver Imagen</span>
            </div>
            )}
          </div>
        )}
        
        {/* Profile image container */}
        <div 
          ref={profileContainerRef}
          className={styles.profileImageContainer}
          onClick={isCardMinimized ? toggleMinimized : toggleButtons}
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
              <User size={18} className={styles.placeholderIcon} />
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
          {!uploading && !isCardMinimized && (
            <div className={styles.editOverlay}>
              <Camera size={14} className={styles.editIcon} />
            </div>
          )}
          
          {/* Loader and progress bar during upload */}
          {uploading && (
            <div className={styles.loader}>
              <Loader size={14} className={styles.loaderIcon} />
              
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
      </div>
      
      
      {/* Welcome message - only show if not minimized */}
      {!isCardMinimized && (
        <animated.p 
          className={styles.welcomeMessage}
          style={{ 
            opacity: !isCardMinimized ? 1 : 0,
            transform: !isCardMinimized ? 'translateX(0)' : 'translateX(-10px)'
          }}
        >
          {getWelcomeMessage()}
        </animated.p>
      )}

      {((!isCardMinimized) || (isCardMinimized && showToggleIcon)) && (
        <div className={styles.toggleMinimizeButton} onClick={toggleMinimized}>
          {isCardMinimized ? (
            <ChevronRight size={14} className={styles.toggleIcon} />
          ) : (
            <ChevronLeft size={14} className={styles.toggleIcon} />
          )}
        </div>
      )}
    </animated.div>
  );
};

export default UserInfoCard;