// front-end/src/components/user_info_card/UserInfoCard.jsx
import { useEffect, useRef, useState } from 'react';
import { Camera, Loader, Eye, User, CircleUserRound, X, Store, Users, Shield } from 'lucide-react';
import { useAuth } from '../../app_context/AuthContext.jsx';
import { useUI } from '../../app_context/UIContext.jsx';
import { useShop } from '../../app_context/ShopContext.jsx';
import { useOrganization } from '../../app_context/OrganizationContext.jsx';
import { useSpring, animated } from '@react-spring/web';
import styles from '../../../../public/css/UserInfoCard.module.css';
import { UserInfoCardUtils } from './UserInfoCardUtils.jsx';
import axiosInstance from '../../utils/app/axiosConfig.js';

//update: Modified to accept userData prop for viewing other users and fetch additional info
const UserInfoCard = ({ onClose, userData = null, isOwnerView = false }) => {
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

  //update: Use provided userData or currentUser
  const displayUser = userData || currentUser;
  const isCurrentUser = !userData || (currentUser?.id_user === userData?.id_user);

  const fileInputRef = useRef(null);
  const [imageKey, setImageKey] = useState(Date.now()); 
  const [hasValidImage, setHasValidImage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  
  //update: New state for shops and organizations
  const [userShops, setUserShops] = useState([]);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [managedOrganization, setManagedOrganization] = useState(null);
  const [contextDataLoading, setContextDataLoading] = useState(false);
  
  const profileContainerRef = useRef(null);
  const popupRef = useRef(null);

  const slideAnimation = useSpring({
    from: {
      opacity: 0,
      transform: 'translate(-50%, -150%)',
    },
    to: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(-50%, 0%)' : 'translate(-50%, -150%)',
    },
    config: {
      mass: 1,
      tension: 180,
      friction: 20
    }
  });
  
  const backdropAnimation = useSpring({
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
    config: {
      duration: 200
    }
  });

  //update: Fetch user's shops and organizations when component mounts
  useEffect(() => {
    if (displayUser?.id_user) {
      fetchUserContextData();
    }
  }, [displayUser?.id_user]);

  //update: Function to fetch shops and organizations for the user
  const fetchUserContextData = async () => {
    if (!displayUser?.id_user) return;
    
    setContextDataLoading(true);
    
    try {
      // Fetch shops if user is a seller
      if (displayUser.type_user === 'seller') {
        try {
          const shopsResponse = await axiosInstance.post('/shop/by-user-id', {
            id_user: displayUser.id_user
          });
          
          if (shopsResponse.data && !shopsResponse.data.error) {
            setUserShops(shopsResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching user shops:', err);
        }
      }
      
      // Fetch organizations for any user type
      try {
        // First try to get participations
        const orgsResponse = await axiosInstance.post('/participant/by-user', {
          id_user: displayUser.id_user
        });
        
        if (orgsResponse.data && !orgsResponse.data.error) {
          const participations = orgsResponse.data.data || [];
          
          //update: Debug to see structure
          console.log('Raw participations response:', participations);
          
          // If participations don't include full organization data, fetch organizations separately
          const organizationsWithDetails = [];
          
          for (const participation of participations) {
            // Check if organization data is already included
            if (participation.name_org || participation.organization?.name_org) {
              // Organization data is already present
              organizationsWithDetails.push({
                id_org: participation.id_org || participation.id_organization,
                name_org: participation.name_org || participation.organization?.name_org,
                is_manager: participation.is_manager === 1 || participation.is_manager === true || participation.is_manager === '1',
                scope_org: participation.scope_org || participation.organization?.scope_org,
                ...participation
              });
            } else if (participation.id_org || participation.id_organization) {
              // Need to fetch organization details
              try {
                const orgId = participation.id_org || participation.id_organization;
                const orgDetailResponse = await axiosInstance.post('/organization/by-id', {
                  id_organization: orgId
                });
                
                if (orgDetailResponse.data && !orgDetailResponse.data.error) {
                  const orgData = orgDetailResponse.data.data;
                  organizationsWithDetails.push({
                    ...orgData,
                    is_manager: participation.is_manager === 1 || participation.is_manager === true || participation.is_manager === '1',
                    participant_id: participation.id_participant
                  });
                }
              } catch (err) {
                console.error(`Error fetching organization ${participation.id_org} details:`, err);
              }
            }
          }
          
          console.log('Organizations with details:', organizationsWithDetails);
          setUserOrganizations(organizationsWithDetails);
          
          // Check if user manages any organization
          const managed = organizationsWithDetails.find(org => org.is_manager);
          if (managed) {
            console.log('User manages organization:', managed);
            setManagedOrganization(managed);
          }
        }
      } catch (err) {
        console.error('Error fetching user organizations:', err);
      }
      
      // Alternative: Try to fetch organizations by user ID directly if available
      if (userOrganizations.length === 0) {
        try {
          const directOrgResponse = await axiosInstance.post('/organization/by-user-id', {
            id_user: displayUser.id_user
          });
          
          if (directOrgResponse.data && !directOrgResponse.data.error) {
            const orgs = directOrgResponse.data.data || [];
            console.log('Direct organization fetch:', orgs);
            
            // Check if this is the user's managed organization
            const managedOrgs = orgs.filter(org => 
              org.id_user === displayUser.id_user || 
              org.manager?.id_user === displayUser.id_user
            );
            
            if (managedOrgs.length > 0) {
              setManagedOrganization(managedOrgs[0]);
              setUserOrganizations(orgs);
            }
          }
        } catch (err) {
          console.error('Error in alternative organization fetch:', err);
        }
      }
    } finally {
      setContextDataLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const toggleButtons = () => {
    //update: Only allow editing for current user
    if (!uploading && isCurrentUser) {
      setShowButtons(!showButtons);
    }
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current && isCurrentUser) {
      fileInputRef.current.click();
    }
    setShowButtons(false);
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (displayUser?.image_user && hasValidImage) {
      const imageUrl = getImageUrl(displayUser.image_user);
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

  useEffect(() => {
    if (showButtons && popupRef.current && profileContainerRef.current) {
      const popup = popupRef.current;
      const profileContainer = profileContainerRef.current;
      const profileRect = profileContainer.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      
      popup.style.top = '';
      popup.style.bottom = '';
      popup.style.left = '';
      popup.style.right = '';
      
      const spaceBelow = window.innerHeight - profileRect.bottom;
      const spaceAbove = profileRect.top;
      
      if (popupRect.height > spaceBelow && spaceAbove > spaceBelow) {
        popup.style.bottom = 'calc(100% + 0.5rem)';
        popup.style.top = 'auto';
      }
      
      const spaceRight = window.innerWidth - profileRect.left;
      
      if (popupRect.width > spaceRight) {
        popup.style.left = 'auto';
        popup.style.right = '0';
      }
    }
  }, [showButtons]);
  
  useEffect(() => {
    const checkImage = async () => {
      if (displayUser?.image_user) {
        const imageUrl = getImageUrl(displayUser.image_user);
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
  }, [displayUser?.image_user, getImageUrl]);

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
    if (displayUser?.image_user || localImageUrl) {
      setImageKey(Date.now());
    }
  }, [displayUser?.image_user, localImageUrl]);

  if (!displayUser) {
    return null;
  }

  //update: Format user type display
  const getUserTypeDisplay = (type) => {
    switch(type) {
      case 'seller': return 'Vendedor/a';
      case 'rider': return 'Repartidor/a';
      case 'user': return 'Usuario/a';
      case 'admin': return 'Administrador/a';
      default: return type;
    }
  };

  return (
    <>
      <animated.div 
        className={styles.backdrop}
        style={backdropAnimation}
        onClick={handleClose}
      />
      
      <animated.div 
        className={styles.userInfoCard}
        style={slideAnimation}
      >
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        
        {/*update: Add title for owner view */}
        {isOwnerView && (
          <h3 className={styles.cardTitle}>Información del Propietario</h3>
        )}
        
        <div className={styles.cardContent}>
          <div className={styles.profileSection}>
            <div 
              ref={profileContainerRef}
              className={styles.profileImageContainer}
              onClick={toggleButtons}
            >
              {hasValidImage ? (
                <img
                  key={imageKey}
                  src={getImageUrl(displayUser.image_user) || ''}
                  alt="Imagen de perfil"
                  className={styles.profileImage}
                  onError={() => {
                    setHasValidImage(false);
                    if (isCurrentUser) {
                      setInfo(prevInfo => ({
                        ...prevInfo,
                        imageInfo: "No tienes imagen de perfil"
                      }));
                    }
                  }}
                  onLoad={() => {
                    setHasValidImage(true);
                    if (isCurrentUser) {
                      setError(prevError => ({
                        ...prevError,
                        imageError: ''
                      }));
                      setInfo(prevInfo => ({
                        ...prevInfo,
                        imageInfo: ''
                      }));
                    }
                  }}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <CircleUserRound size={40} className={styles.placeholderIcon} />
                </div>
              )}
              
              {/*update: Only show upload input for current user */}
              {isCurrentUser && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="profile-image-input"
                  disabled={uploading}
                />
              )}
              
              {/*update: Only show edit overlay for current user */}
              {!uploading && isCurrentUser && (
                <div className={styles.editOverlay}>
                  <Camera size={20} className={styles.editIcon} />
                </div>
              )}
              
              {uploading && isCurrentUser && (
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
            
            {/*update: Only show action buttons for current user */}
            {showButtons && isCurrentUser && (
              <div 
                id="profile-actions-popup" 
                className={styles.actionsPopup}
                ref={popupRef}
              >
                <div className={styles.actionButton} onClick={handleUploadClick}>
                  <Camera size={16} className={styles.actionIcon} />
                  <span className={styles.actionText}>Subir Imagen</span>
                </div>
                
                {hasValidImage && (
                  <div className={styles.actionButton} onClick={handleViewClick}>
                    <Eye size={16} className={styles.actionIcon} />
                    <span className={styles.actionText}>Ver Imagen</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>
              {displayUser.name_user || 'Usuario'}
            </h2>
            <p className={styles.userType}>
              {getUserTypeDisplay(displayUser.type_user)}
            </p>
            {displayUser.location_user && (
              <p className={styles.userLocation}>
                📍 {displayUser.location_user}
              </p>
            )}
            {/* {displayUser.age_user && (
              <p className={styles.userAge}>
                Edad: {displayUser.age_user} años
              </p>
            )} */}
            {displayUser.email_user && (
              <p className={styles.userEmail}>
                {displayUser.email_user}
              </p>
            )}
            
            {/*update: Display shops for sellers */}
            {displayUser.type_user === 'seller' && userShops.length > 0 && (
              <div className={styles.contextSection}>
                <div className={styles.contextHeader}>
                  <Store size={14} className={styles.contextIcon} />
                  <span className={styles.contextTitle}>
                    {userShops.length === 1 ? 'Tienda' : 'Tiendas'}
                  </span>
                </div>
                <div className={styles.contextList}>
                  {userShops.map(shop => (
                    <div key={shop.id_shop} className={styles.contextItem}>
                      <span className={styles.contextItemName}>{shop.name_shop}</span>
                      {shop.location_shop && (
                        <span className={styles.contextItemDetail}>📍 {shop.location_shop}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/*update: Display all organizations with role information */}
            {userOrganizations.length > 0 && (
              <div className={styles.contextSection}>
                <div className={styles.contextHeader}>
                  <Users size={14} className={styles.contextIcon} />
                  <span className={styles.contextTitle}>
                    {userOrganizations.length === 1 ? 'Organización' : 'Organizaciones'}
                  </span>
                </div>
                <div className={styles.contextList}>
                  {userOrganizations.map(org => {
                    const orgId = org.id_org || org.id_organization;
                    const orgName = org.name_org || org.organization?.name_org || 'Organización';
                    const isManager = org.is_manager;
                    const isFounder = org.id_user === displayUser.id_user || 
                                     org.manager?.id_user === displayUser.id_user;
                    
                    return (
                      <div key={orgId} className={styles.contextItem}>
                        <div className={styles.contextItemHeader}>
                          {isManager && (
                            <Shield size={12} className={styles.roleIcon} />
                          )}
                          <span className={styles.contextItemName}>{orgName}</span>
                        </div>
                        
                        {org.scope_org && (
                          <span className={styles.contextItemDetail}>
                            Ámbito: {org.scope_org}
                          </span>
                        )}
                        
                        <div className={styles.roleInfo}>
                          {isFounder && isManager ? (
                            <span className={styles.contextItemBadge + ' ' + styles.founderBadge}>
                              Fundador/a y Administrador/a
                            </span>
                          ) : isManager ? (
                            <span className={styles.contextItemBadge + ' ' + styles.managerBadge}>
                              Administrador/a
                            </span>
                          ) : (
                            <span className={styles.contextItemBadge + ' ' + styles.memberBadge}>
                              Miembro
                            </span>
                          )}
                          
                          {org.joined_date && (
                            <span className={styles.joinedDate}>
                              Desde: {new Date(org.joined_date).toLocaleDateString('es-ES', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/*update: Loading indicator for context data */}
            {contextDataLoading && (
              <div className={styles.contextLoading}>
                <Loader size={14} className={styles.loadingIcon} />
                <span>Cargando información adicional...</span>
              </div>
            )}
          </div>
        </div>
      </animated.div>
    </>
  );
};

export default UserInfoCard;