import { useEffect, useState, useRef } from 'react';
import ProductCreationFormUtils from './ProductCreationFormUtils.jsx';
import { useAuth } from '../../../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../app_context/ProductContext.jsx';
import styles from '../../../../../../../../public/css/ProductCreationForm.module.css';
import { AlertCircle, PackagePlus, Save, RefreshCw } from 'lucide-react';

import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';

import ProductImageUpload from './components/ProductImageUpload.jsx';
import ProductBasicInfo from './components/ProductBasicInfo.jsx';
import ProductDetails from './components/ProductDetails.jsx';

import StepTracker from '../../../../../navigation_components/StepTracker.jsx';
import NavigationButtons from '../../../../../navigation_components/NavigationButtons.jsx';

const ProductCreationForm = () => {
  const {
    handleChange,
    handleNumericInputChange,
    handleSubmit,
    handleUpdate,
    productCount,
    productLimit,
    fetchProductsByShop,
    handleImageUpload,
    // handleViewProductList: navigateToProductList,
    resetNewProductData
  } = ProductCreationFormUtils();

  // Auth context
  const { currentUser } = useAuth();
  
  // UI context
  const { 
    setError, 
    uploading, 
    setShowErrorCard,
    setSuccess,
    setShowSuccessCard,
    // 🔄 UPDATE: Added modal state for reset confirmation
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    isDeclined,
    setIsDeclined
  } = useUI();
  
  // Shop context
  const { selectedShop } = useShop();
  
  // Product context
  const { 
    newProductData: productData,
    filterOptions,
    // setShowProductManagement,
    isUpdatingProduct,
    // setIsUpdatingProduct,
    selectedProductToUpdate,
    // setSelectedProductToUpdate,
    productTypesAndSubtypes,
    setNewProductData,
    refreshProductList,
    shopToProductTypesMap
  } = useProduct();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // 🔄 UPDATE: Added state to track if form reset is pending
  const [isResetPending, setIsResetPending] = useState(false);
  
  // Get available product types based on shop type
  const availableProductTypes = selectedShop?.type_shop 
    ? shopToProductTypesMap[selectedShop.type_shop] || []
    : [];

  // Filter product types based on the shop type
  const filteredProductTypes = availableProductTypes.length > 0
    ? availableProductTypes
    : Object.keys(productTypesAndSubtypes);

  // Set image preview for product being updated
  useEffect(() => {
    if (isUpdatingProduct && selectedProductToUpdate?.image_product) {
      // Get image URL using your existing utility
      const imageUrl = formatImageUrl(selectedProductToUpdate.image_product);
      setImagePreview(imageUrl);
    } else if (!isUpdatingProduct) {
      // Clear image when creating a new product
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [isUpdatingProduct, selectedProductToUpdate]);

  // Load data for editing if in update mode
  useEffect(() => {
    if (isUpdatingProduct && selectedProductToUpdate) {
      Object.keys(selectedProductToUpdate).forEach(key => {
        if (key in productData) {
          handleChange({
            target: {
              name: key,
              value: selectedProductToUpdate[key]
            }
          });
        }
      });
    } else if (isUpdatingProduct && !selectedProductToUpdate) {
      // We're in "create new product" mode (isUpdatingProduct is true but no selectedProductToUpdate)
      console.log('ProductCreationForm - In create new product mode');
    }
  }, [isUpdatingProduct, selectedProductToUpdate, productData, handleChange]);

  // Load products when selected shop changes
  useEffect(() => {
    if (selectedShop?.id_shop) {
      fetchProductsByShop();
    }
  }, [selectedShop, fetchProductsByShop]);

  // Reset product type when shop changes
  useEffect(() => {
    if (selectedShop && !selectedProductToUpdate) {
      setNewProductData(prev => ({
        ...prev,
        type_product: '',
        subtype_product: ''
      }));
    }
  }, [selectedShop, selectedProductToUpdate, setNewProductData]);

  // 🔄 UPDATE: Added effect to handle modal confirmation for form reset
  useEffect(() => {
    if (isAccepted && isResetPending) {
      // Reset form if user confirmed
      resetForm();
      setIsAccepted(false);
      setIsResetPending(false);
    } else if (isDeclined && isResetPending) {
      // Cancel reset if user declined
      setIsDeclined(false);
      setIsResetPending(false);
    }
  }, [isAccepted, isDeclined, isResetPending]);

  // // Using the navigation handler
  // const handleViewProductList = () => {
  //   navigateToProductList(setIsUpdatingProduct, setSelectedProductToUpdate, setShowProductManagement);
  // };

  // 🔄 UPDATE: Added resetForm function
  const resetForm = () => {
    // Reset to first step
    setCurrentStep(1);
    
    // Clear product data using existing utility
    resetNewProductData();
    
    // Reset image-related states
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset upload progress
    setUploadProgress(0);
    
    // Show success message
    setSuccess(prevSuccess => ({
      ...prevSuccess,
      productSuccess: "¡Formulario limpiado!"
    }));
    setShowSuccessCard(true);
    
    console.log('Product form has been reset to default values');
  };

  // 🔄 UPDATE: Added confirmation method to use modal dialog
  const confirmResetForm = () => {
    // Check if form has any data worth confirming
    const isFormEmpty = !productData.name_product && 
                        !productData.price_product && 
                        !productData.type_product && 
                        !selectedImage;
    
    if (isFormEmpty) {
      resetForm();
      return;
    }
    
    // Set pending reset flag to true
    setIsResetPending(true);
    
    // Open confirmation modal
    setModalMessage("¿Estás seguro de limpiar todos los campos del formulario?");
    setIsModalOpen(true);
  };

  // Add navigation Utils
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Add validation for current step
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1: // Image upload - image is optional, but name and price are required
        if (!productData.name_product || productData.price_product === '') {
          setError(prevError => ({
            ...prevError,
            productError: "Nombre y precio del producto son requeridos."
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      case 2: // Basic info
        if (!productData.type_product || !productData.subtype_product) {
          setError(prevError => ({
            ...prevError,
            productError: "Tipo y subtipo de producto son requeridos."
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      case 3: // Additional details - most fields are optional
        return true;
      default:
        return true;
    }
  };

  // Handle next button with validation
  const handleNextClick = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // First validate the current step
    if (!validateCurrentStep()) {
      return;
    }
    
    try {
      let success;
      
      if (selectedProductToUpdate) {
        // Update existing product with image if selected
        success = await handleUpdate(e, selectedImage);
        
        // If product update succeeded and user selected an image
        if (success && selectedImage) {
          await handleImageUpload(
            selectedImage, 
            selectedProductToUpdate.id_product,
            (progress) => setUploadProgress(progress)
          );
        }
      } else {
        // Create new product with image if selected
        success = await handleSubmit(e, selectedImage);
      }
      
      // Clear image selection after successful submission
      if (success) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedImage(null);
        setImagePreview(null);
        
        // Force refresh of the product list in the ShopProductsList component
        refreshProductList();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Function to display product limit information
  const renderProductLimitInfo = () => {
    if (selectedProductToUpdate) return null; // Don't show during updates
    
    // Determine indicator color based on how close user is to limit
    const percentUsed = (productCount / productLimit) * 100;
    let statusColor = 'green';
    
    if (percentUsed >= 90) {
      statusColor = 'red';
    } else if (percentUsed >= 70) {
      statusColor = 'orange';
    }
    
    return (
      <div className={styles.productLimitInfo}>
          <div className={styles.limitHeader}>
              <AlertCircle size={20} color={statusColor} className={styles.alertIcon}/>
              <span>Límite de productos: {productCount} / {productLimit}</span>
          </div>
          {!currentUser?.category_user && productCount >= productLimit * 0.7 && (
            <p className={styles.upgradeMessage}>
              Conviértete en sponsor para aumentar tu límite a 100 productos.
            </p>
          )}
      </div>
    );
  };

  // Render the appropriate step component based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductImageUpload 
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            productData={productData}
            onProductDataChange={handleChange}
            onNumericInputChange={handleNumericInputChange}
            uploading={uploading}
            uploadProgress={uploadProgress}
            fileInputRef={fileInputRef}
            setError={setError}
            setShowErrorCard={setShowErrorCard}
          />
        );
      case 2:
        return (
          <ProductBasicInfo 
            productData={productData}
            onProductDataChange={handleChange}
            productTypesAndSubtypes={productTypesAndSubtypes}
            filteredProductTypes={filteredProductTypes}
            setNewProductData={setNewProductData}
            filterOptions={filterOptions}
          />
        );
      case 3:
        return (
          <ProductDetails 
            productData={productData}
            onProductDataChange={handleChange}
            onNumericInputChange={handleNumericInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
    {renderProductLimitInfo()}
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.formTitle}>
          {selectedProductToUpdate ? 'Actualizar Producto' : 'Crear un nuevo producto'}
        </h1>
        <StepTracker currentStep={currentStep} totalSteps={totalSteps} />
      </div>
      
      {/* Shop type and subtype guidance */}
      {selectedShop && !selectedProductToUpdate && (
        <div className={styles.shopTypeGuidance}>
          <p>Tienda de tipo: <strong>{selectedShop.type_shop}</strong></p>
          {/* 🏪 UPDATE: Added shop subtype display */}
          <p>Subtipo: <strong>{selectedShop.subtype_shop || 'No especificado'}</strong></p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className={styles.form}>
        {renderStepContent()}
          
        {/* 🔄 UPDATE: Added form buttons container to include reset button */}
        <div className={styles.buttonsContainer}>
          {/* Reset button */}
          <button
            type="button"
            onClick={confirmResetForm}
            className={styles.resetButton}
            title="Limpiar formulario"
            disabled={uploading}
          >
            <RefreshCw size={16} className={styles.resetIcon} />
            Limpiar
          </button>
          
          <NavigationButtons 
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNextClick}
            onPrevious={goToPreviousStep}
            isSubmitting={uploading}
            submitLabel={selectedProductToUpdate ? 'Actualizar' : 'Crear'}
            processingLabel="Procesando..."
            SubmitIcon={selectedProductToUpdate ? Save : PackagePlus}
          />
        </div>
        
        {!selectedProductToUpdate && productCount >= productLimit && (
          <p className={styles.errorMessage}>
            Has alcanzado el límite de productos permitidos
          </p>
        )}
      </form>
    </div>
    </>
  );
};

export default ProductCreationForm;