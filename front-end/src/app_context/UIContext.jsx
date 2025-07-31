import React, { createContext, useContext, useState } from 'react';

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
  
  // Navigation and UI display states
  const [showTopBar, setShowTopBar] = useState(false); 
  const [showLandingPage, setShowLandingPage] = useState(true); 
  const [showShopManagement, setShowShopManagement] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showShopWindow, setShowShopWindow] = useState(false);
  //update: Added showShopStore state for displaying individual shop stores
  const [showShopStore, setShowShopStore] = useState(false);
  const [selectedShopForStore, setSelectedShopForStore] = useState(null);

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  // 🚀 UPDATE: Added isDeclined state
  const [isDeclined, setIsDeclined] = useState(false);
  // 🚀 UPDATE: Added modalConfirmCallback for better handling of modal actions
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  
  // 🔄 UPDATE: Added isCardMinimized state for UserInfoCard
  const [isCardMinimized, setIsCardMinimized] = useState(false);

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

  // 🚀 UPDATE: Added new method to open simple confirmation modal
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
  
  // ⚠️ FIXED: Added individual clear functions
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
        showShopWindow, setShowShopWindow,
        showShopStore, setShowShopStore,
        selectedShopForStore, setSelectedShopForStore,
        
        showProductManagement, setShowProductManagement,
        
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