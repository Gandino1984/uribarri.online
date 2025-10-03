import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  // Messages and notification state
  const [info, setInfo] = useState({});
  const [error, setError] = useState({});
  const [success, setSuccess] = useState({});
  
  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [cancelAction, setCancelAction] = useState(null);
  
  // Card display states
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [showErrorCard, setShowErrorCard] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  
  //update: Initialize navigation states - only restore from localStorage if user is logged in
  const [showTopBar, setShowTopBar] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showTopBar : false;
  });
  
  const [showLandingPage, setShowLandingPage] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return true; // Always start with LandingPage if no user
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showLandingPage : true;
  });
  
  const [showShopManagement, setShowShopManagement] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showShopManagement : false;
  });
  
  const [showProductManagement, setShowProductManagement] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showProductManagement : false;
  });
  
  const [showShopWindow, setShowShopWindow] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showShopWindow : false;
  });
  
  const [showShopStore, setShowShopStore] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showShopStore : false;
  });
  
  const [selectedShopForStore, setSelectedShopForStore] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return null;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).selectedShopForStore : null;
  });
  
  const [showShopsListBySeller, setShowShopsListBySeller] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showShopsListBySeller : false;
  });
  
  const [showRiderManagement, setShowRiderManagement] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showRiderManagement : false;
  });
  
  const [showOffersBoard, setShowOffersBoard] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showOffersBoard : false;
  });
  
  const [showInfoManagement, setShowInfoManagement] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showInfoManagement : false;
  });

  //update: Navigation intent - don't persist across sessions, only within active session
  const [navigationIntent, setNavigationIntent] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      // Clear any stale navigation intent if no user is logged in
      localStorage.removeItem('navigationIntent');
      return null;
    }
    return localStorage.getItem('navigationIntent') || null;
  });

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  
  const [isCardMinimized, setIsCardMinimized] = useState(false);

  //update: Save navigation state to localStorage whenever it changes
  useEffect(() => {
    const navigationState = {
      showTopBar,
      showLandingPage,
      showShopManagement,
      showProductManagement,
      showShopWindow,
      showShopStore,
      selectedShopForStore,
      showShopsListBySeller,
      showRiderManagement,
      showOffersBoard,
      showInfoManagement
    };
    
    console.log('Saving navigation state to localStorage:', navigationState);
    localStorage.setItem('appNavigationState', JSON.stringify(navigationState));
  }, [
    showTopBar,
    showLandingPage,
    showShopManagement,
    showProductManagement,
    showShopWindow,
    showShopStore,
    selectedShopForStore,
    showShopsListBySeller,
    showRiderManagement,
    showOffersBoard,
    showInfoManagement
  ]);

  //update: Save navigation intent to localStorage
  useEffect(() => {
    if (navigationIntent) {
      console.log('Saving navigation intent to localStorage:', navigationIntent);
      localStorage.setItem('navigationIntent', navigationIntent);
    } else {
      localStorage.removeItem('navigationIntent');
    }
  }, [navigationIntent]);
  
  //update: Clean up stale navigation state on mount if no user is logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      console.log('No user logged in - clearing any stale navigation state');
      localStorage.removeItem('navigationIntent');
      
      // Only clear navigation state if we're not on the landing page
      // This prevents clearing state during the initial mount
      const storedState = localStorage.getItem('appNavigationState');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        // If stored state shows we're not on landing page, clear it
        if (!parsed.showLandingPage) {
          console.log('Clearing stale navigation state from previous session');
          localStorage.removeItem('appNavigationState');
        }
      }
    }
  }, []); // Run only once on mount

  //update: Function to clear all navigation state (for logout)
  const clearNavigationState = () => {
    console.log('=== CLEARING ALL NAVIGATION STATE ===');
    localStorage.removeItem('appNavigationState');
    localStorage.removeItem('navigationIntent');
    
    setShowTopBar(false);
    setShowLandingPage(true);
    setShowShopManagement(false);
    setShowProductManagement(false);
    setShowShopWindow(false);
    setShowShopStore(false);
    setSelectedShopForStore(null);
    setShowShopsListBySeller(false);
    setShowRiderManagement(false);
    setShowOffersBoard(false);
    setShowInfoManagement(false);
    setNavigationIntent(null);
    
    console.log('Navigation state cleared - redirecting to LandingPage');
  };

  // Confirmation modal helpers
  const openConfirmationModal = (message, onConfirm, onCancel) => {
    setConfirmationMessage(message);
    setConfirmAction(() => onConfirm);
    setCancelAction(() => onCancel);
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmationMessage('');
    setConfirmAction(null);
    setCancelAction(null);
  };

  // Handle confirm/cancel actions
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    closeConfirmationModal();
  };

  const handleCancel = () => {
    if (cancelAction) {
      cancelAction();
    }
    closeConfirmationModal();
  };

  const openModal = (message, callback) => {
    setModalMessage(message);
    setModalConfirmCallback(() => callback);
    setIsModalOpen(true);
    setIsAccepted(false);
    setIsDeclined(false);
  };

  // Clear notifications
  const clearNotifications = () => {
    setInfo({});
    setError({});
    setSuccess({});
  };
  
  const clearError = () => {
    setError({});
  };
  
  const clearInfo = () => {
    setInfo({});
  };
  
  const clearSuccess = () => {
    setSuccess({});
  };

  // Open image modal with a specific image
  const openImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc('');
  };

  return (
    <UIContext.Provider 
      value={{
        // Messages and notifications
        info, setInfo,
        error, setError,
        success, setSuccess,
        clearNotifications,
        clearError,
        clearInfo, 
        clearSuccess,
        
        // Modal handlers
        showConfirmationModal, setShowConfirmationModal,
        confirmationMessage, setConfirmationMessage,
        openConfirmationModal, closeConfirmationModal,
        handleConfirm, handleCancel,
        
        // Card visibility
        showInfoCard, setShowInfoCard,
        showErrorCard, setShowErrorCard,
        showSuccessCard, setShowSuccessCard,
        
        // Navigation and UI state
        showTopBar, setShowTopBar,
        showLandingPage, setShowLandingPage,
        showShopManagement, setShowShopManagement,
        showProductManagement, setShowProductManagement,
        showShopWindow, setShowShopWindow,
        showShopStore, setShowShopStore,
        selectedShopForStore, setSelectedShopForStore,
        showShopsListBySeller, setShowShopsListBySeller,
        showRiderManagement, setShowRiderManagement,
        showOffersBoard, setShowOffersBoard,
        showInfoManagement, setShowInfoManagement,
        
        //update: Navigation intent
        navigationIntent, setNavigationIntent,
        clearNavigationState,
        
        // Image modal handlers
        showImageModal, setShowImageModal,
        modalImageSrc, setModalImageSrc,
        openImageModal, closeImageModal,
    
        uploading, setUploading,
        isImageModalOpen, setIsImageModalOpen,
        selectedImageForModal, setSelectedImageForModal,
        
        isModalOpen, setIsModalOpen,
        modalMessage, setModalMessage,
        isAccepted, setIsAccepted,
        isDeclined, setIsDeclined,
        modalConfirmCallback, setModalConfirmCallback,
        openModal,
        isCardMinimized, setIsCardMinimized
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;