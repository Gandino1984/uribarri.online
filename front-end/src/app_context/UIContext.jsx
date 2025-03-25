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
    showSuccessCard, setShowSuccessCard,
    success, setSuccess,
    clearSuccess,
    showInfoCard, setShowInfoCard,
    info, setInfo,
    clearInfo,
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