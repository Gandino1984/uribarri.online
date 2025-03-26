import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Navigation/view states
  const [showShopManagement, setShowShopManagement] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  // Notification states
  const [showErrorCard, setShowErrorCard] = useState(false);
  const [error, setError] = useState({
    userError: '',
    passwordError: '',
    passwordRepeatError: '',
    ipError: '',
    userlocationError: '',
    userTypeError: '',
    databaseResponseError: '',
    shopError: '',
    productError: '',
    imageError: ''
  });

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState({
    loginSuccess: '',
    shopSuccess: '',
    productSuccess: '',
    updateSuccess: '',
    deleteSuccess: '',
    imageSuccess: ''
  });

  const [showInfoCard, setShowInfoCard] = useState(false);
  const [info, setInfo] = useState({
    loginInfo: '',
    shopInfo: '',
    productInfo: '',
    updateInfo: '',
    deleteInfo: '',
    imageInfo: ''
  });

  const [imageError, setImageError] = useState(false);
  const [ip, setIp] = useState('');

  // 🔄 UPDATE: Improved clear functions to ensure only one message is displayed at a time
  const clearError = () => {
    setError({
      userError: '',
      passwordError: '',
      passwordRepeatError: '',
      ipError: '',
      userlocationError: '',
      userTypeError: '',
      databaseResponseError: '',
      shopError: '',
      productError: '',
      imageError: ''
    });
    setShowErrorCard(false);
  };

  const clearSuccess = () => {
    setSuccess({
      loginSuccess: '',
      shopSuccess: '',
      productSuccess: '',
      updateSuccess: '',
      deleteSuccess: '',
      imageSuccess: ''
    });
    setShowSuccessCard(false);
  };

  const clearInfo = () => {
    setInfo({
      loginInfo: '',
      shopInfo: '',
      productInfo: '',
      updateInfo: '',
      deleteInfo: '',
      imageInfo: ''
    });
    setShowInfoCard(false);
  };

  // 🔄 UPDATE: Helper functions to set single messages and clear others
  const setSingleError = (key, message) => {
    // First clear all errors
    const clearedErrors = {
      userError: '',
      passwordError: '',
      passwordRepeatError: '',
      ipError: '',
      userlocationError: '',
      userTypeError: '',
      databaseResponseError: '',
      shopError: '',
      productError: '',
      imageError: ''
    };
    
    // Then set only the specific error
    setError({
      ...clearedErrors,
      [key]: message
    });
    
    if (message) {
      setShowErrorCard(true);
    }
  };

  const setSingleSuccess = (key, message) => {
    // First clear all success messages
    const clearedSuccess = {
      loginSuccess: '',
      shopSuccess: '',
      productSuccess: '',
      updateSuccess: '',
      deleteSuccess: '',
      imageSuccess: ''
    };
    
    // Then set only the specific success message
    setSuccess({
      ...clearedSuccess,
      [key]: message
    });
    
    if (message) {
      setShowSuccessCard(true);
    }
  };

  const setSingleInfo = (key, message) => {
    // First clear all info messages
    const clearedInfo = {
      loginInfo: '',
      shopInfo: '',
      productInfo: '',
      updateInfo: '',
      deleteInfo: '',
      imageInfo: ''
    };
    
    // Then set only the specific info message
    setInfo({
      ...clearedInfo,
      [key]: message
    });
    
    if (message) {
      setShowInfoCard(true);
    }
  };

  const value = {
    // Modal states
    isModalOpen, setIsModalOpen,
    isAccepted, setIsAccepted,
    isDeclined, setIsDeclined,
    modalMessage, setModalMessage,
    isImageModalOpen, setIsImageModalOpen,
    selectedImageForModal, setSelectedImageForModal,
    
    // Loading states
    loading, setLoading,
    uploading, setUploading,
    
    // Navigation/view states
    showShopManagement, setShowShopManagement,
    showProductManagement, setShowProductManagement,
    showLandingPage, setShowLandingPage,
    
    // Notification states
    showErrorCard, setShowErrorCard,
    error, setError,
    clearError,
    setSingleError,
    showSuccessCard, setShowSuccessCard,
    success, setSuccess,
    clearSuccess,
    setSingleSuccess,
    showInfoCard, setShowInfoCard,
    info, setInfo,
    clearInfo,
    setSingleInfo,
    imageError, setImageError,
    ip, setIp,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;