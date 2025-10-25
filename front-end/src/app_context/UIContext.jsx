// front-end/src/app_context/UIContext.jsx
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
  
  //update: Add notification history state
  const [cardHistory, setCardHistory] = useState([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const MAX_HISTORY_ITEMS = 10;
  
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [showTopBar, setShowTopBar] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    
    const stored = localStorage.getItem('appNavigationState');
    return stored ? JSON.parse(stored).showTopBar : false;
  });
  
  const [showLandingPage, setShowLandingPage] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return true;
    
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

  const [navigationIntent, setNavigationIntent] = useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
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

  // Video tutorial modal states
  const [showVideoTutorialModal, setShowVideoTutorialModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');

  const openVideoTutorial = (videoUrl, title) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setShowVideoTutorialModal(true);
  };

  const closeVideoTutorial = () => {
    setShowVideoTutorialModal(false);
    setCurrentVideoUrl('');
    setCurrentVideoTitle('');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    const currentPath = window.location.pathname;
    
    console.log('=== URL DETECTION ON MOUNT ===');
    console.log('Current path:', currentPath);
    console.log('Has token:', !!token);
    console.log('Has email:', !!email);
    
    if (currentPath === '/reset-password' || currentPath.includes('/reset-password')) {
      console.log('✅ RESET PASSWORD PAGE DETECTED');
      setShowResetPassword(true);
      setShowEmailVerification(false);
      setShowForgotPassword(false);
      setShowLandingPage(false);
      setShowShopManagement(false);
      setShowShopStore(false);
      setShowShopWindow(false);
      setShowInfoManagement(false);
      setShowProductManagement(false);
      setShowShopsListBySeller(false);
      setShowRiderManagement(false);
      setShowOffersBoard(false);
      setShowTopBar(false);
    } else if (currentPath === '/forgot-password' || currentPath.includes('/forgot-password')) {
      console.log('✅ FORGOT PASSWORD PAGE DETECTED');
      setShowForgotPassword(true);
      setShowEmailVerification(false);
      setShowResetPassword(false);
      setShowLandingPage(false);
      setShowShopManagement(false);
      setShowShopStore(false);
      setShowShopWindow(false);
      setShowInfoManagement(false);
      setShowProductManagement(false);
      setShowShopsListBySeller(false);
      setShowRiderManagement(false);
      setShowOffersBoard(false);
      setShowTopBar(false);
    } else if ((currentPath === '/verify-email' || currentPath.includes('/verify-email')) && token && email) {
      console.log('✅ EMAIL VERIFICATION PAGE DETECTED');
      setShowEmailVerification(true);
      setShowResetPassword(false);
      setShowForgotPassword(false);
      setShowLandingPage(false);
      setShowShopManagement(false);
      setShowShopStore(false);
      setShowShopWindow(false);
      setShowInfoManagement(false);
      setShowProductManagement(false);
      setShowShopsListBySeller(false);
      setShowRiderManagement(false);
      setShowOffersBoard(false);
      setShowTopBar(false);
    } else {
      console.log('⚡️ Normal page - no special routing needed');
    }
    
    console.log('===================================');
  }, []);

  useEffect(() => {
    if (showEmailVerification || showResetPassword || showForgotPassword) return;
    
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
    showInfoManagement,
    showEmailVerification,
    showResetPassword,
    showForgotPassword
  ]);

  useEffect(() => {
    if (navigationIntent) {
      console.log('Saving navigation intent to localStorage:', navigationIntent);
      localStorage.setItem('navigationIntent', navigationIntent);
    } else {
      localStorage.removeItem('navigationIntent');
    }
  }, [navigationIntent]);
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      console.log('No user logged in - clearing any stale navigation state');
      localStorage.removeItem('navigationIntent');
      
      const storedState = localStorage.getItem('appNavigationState');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        if (!parsed.showLandingPage) {
          console.log('Clearing stale navigation state from previous session');
          localStorage.removeItem('appNavigationState');
        }
      }
    }
  }, []);

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
    setShowEmailVerification(false);
    setShowResetPassword(false);
    setShowForgotPassword(false);
    
    console.log('Navigation state cleared - redirecting to LandingPage');
  };

  //update: Add card to history
  const addToCardHistory = (type, content) => {
    const newCard = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toISOString()
    };
    
    setCardHistory(prev => {
      const updated = [newCard, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  };

  //update: Clear card history
  const clearCardHistory = () => {
    setCardHistory([]);
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

  const setSingleError = (key, message) => {
    setError({ [key]: message });
    setShowErrorCard(true);
  };

  const setSingleSuccess = (key, message) => {
    setSuccess({ [key]: message });
    setShowSuccessCard(true);
  };

  const setSingleInfo = (key, message) => {
    setInfo({ [key]: message });
    setShowInfoCard(true);
  };

  const openImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImageSrc('');
  };

  return (
    <UIContext.Provider 
      value={{
        info, setInfo,
        error, setError,
        success, setSuccess,
        clearNotifications,
        clearError,
        clearInfo, 
        clearSuccess,
        setSingleError,
        setSingleSuccess,
        setSingleInfo,
        
        showConfirmationModal, setShowConfirmationModal,
        confirmationMessage, setConfirmationMessage,
        openConfirmationModal, closeConfirmationModal,
        handleConfirm, handleCancel,
        
        showInfoCard, setShowInfoCard,
        showErrorCard, setShowErrorCard,
        showSuccessCard, setShowSuccessCard,
        
        //update: Card history exports
        cardHistory,
        addToCardHistory,
        clearCardHistory,
        showNotificationHistory,
        setShowNotificationHistory,
        
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
        
        navigationIntent, setNavigationIntent,
        clearNavigationState,
        
        showEmailVerification, 
        setShowEmailVerification,
        showResetPassword,
        setShowResetPassword,
        showForgotPassword,
        setShowForgotPassword,
        
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
        isCardMinimized, setIsCardMinimized,

        // Video tutorial modal exports
        showVideoTutorialModal,
        currentVideoUrl,
        currentVideoTitle,
        openVideoTutorial,
        closeVideoTutorial
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;