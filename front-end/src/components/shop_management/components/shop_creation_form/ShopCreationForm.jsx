import { useEffect, useState, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styles from '../../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormUtils } from './ShopCreationFormUtils.jsx';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { formAnimation } from '../../../../utils/animation/transitions.js';
//update: Import formatImageUrl to properly handle image URLs
import { formatImageUrl } from '../../../../utils/image/imageUploadService.js';
//update: Import axios instance for debugging
import axiosInstance from '../../../../utils/app/axiosConfig.js';

import ShopImageUpload from './components/ShopImageUpload.jsx';
import ShopBasicInfo from './components/ShopBasicInfo.jsx';
import ShopSchedule from './components/ShopSchedule.jsx';

import StepTracker from '../../../navigation_components/StepTracker.jsx';
import NavigationButtons from '../../../navigation_components/NavigationButtons.jsx';

const ShopCreationForm = () => {
  const { currentUser } = useAuth();
  
  const { 
    setError,
    setShowErrorCard,
    uploading,
    setUploading,
    setSuccess,
    setShowSuccessCard,
    setIsModalOpen,
    setModalMessage,
    isAccepted,
    setIsAccepted,
    isDeclined,
    setIsDeclined
  } = useUI();
  
  const {
    newShop, 
    setNewShop,
    shopTypesAndSubtypes,
    selectedShop,
    setShowShopCreationForm,
    setSelectedShop,
    //update: Add typesLoading state
    typesLoading
  } = useShop();

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload
  } = ShopCreationFormUtils();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [hasContinuousSchedule, setHasContinuousSchedule] = useState(false);

  // state for step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Add debug flag
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  const [isResetPending, setIsResetPending] = useState(false);
  
  // state to handle animation when component exits
  const [isExiting, setIsExiting] = useState(false);
  
  const defaultShopValues = {
    name_shop: '',
    //update: Use id_type only, removed id_subtype
    id_type: '',
    location_shop: '',
    id_user: currentUser?.id_user || '',
    calification_shop: 0,
    image_shop: '',
    morning_open: '00:00',
    morning_close: '00:00',
    afternoon_open: '00:00',
    afternoon_close: '00:00',
    has_delivery: false,
    open_monday: true,
    open_tuesday: true,
    open_wednesday: true,
    open_thursday: true,
    open_friday: true,
    open_saturday: true,
    open_sunday: false
  };

  useEffect(() => {
    if (currentUser?.id_user) {
      setNewShop(prev => {
        // Only update if the ID is different to avoid unnecessary rerenders
        if (prev?.id_user !== currentUser.id_user) {
          console.log('Updating user ID in form:', currentUser.id_user);
          return {
            ...prev,
            id_user: currentUser.id_user
          };
        }
        return prev;
      });
    }
  }, [currentUser?.id_user, setNewShop]); 

  useEffect(() => {
    if (selectedShop && currentUser?.id_user) {
      console.log('ShopCreationForm - Setting up form for update mode');
      console.log('Selected shop:', selectedShop);
      console.log('Shop image_shop value:', selectedShop.image_shop);
      
      // Detect if shop has continuous schedule
      const shopHasContinuousSchedule = !selectedShop.morning_close || !selectedShop.afternoon_open;
      setHasContinuousSchedule(shopHasContinuousSchedule);
      
      setNewShop({
        name_shop: selectedShop.name_shop,
        //update: Use id_type only from selected shop
        id_type: selectedShop.id_type,
        location_shop: selectedShop.location_shop,
        id_user: currentUser.id_user, // Ensure we always set the current user ID
        calification_shop: selectedShop.calification_shop,
        image_shop: selectedShop.image_shop,
        morning_open: selectedShop.morning_open || '',
        morning_close: selectedShop.morning_close || '',
        afternoon_open: selectedShop.afternoon_open || '',
        afternoon_close: selectedShop.afternoon_close || '',
        has_delivery: selectedShop.has_delivery || false,
        open_monday: selectedShop.open_monday !== undefined ? selectedShop.open_monday : true,
        open_tuesday: selectedShop.open_tuesday !== undefined ? selectedShop.open_tuesday : true,
        open_wednesday: selectedShop.open_wednesday !== undefined ? selectedShop.open_wednesday : true,
        open_thursday: selectedShop.open_thursday !== undefined ? selectedShop.open_thursday : true,
        open_friday: selectedShop.open_friday !== undefined ? selectedShop.open_friday : true,
        open_saturday: selectedShop.open_saturday !== undefined ? selectedShop.open_saturday : true,
        open_sunday: selectedShop.open_sunday !== undefined ? selectedShop.open_sunday : false
      });

      //update: Enhanced debug logging for image preview
      if (selectedShop.image_shop) {
        console.log('Attempting to format image URL for preview');
        console.log('axios baseURL:', axiosInstance.defaults.baseURL);
        
        const imageUrl = formatImageUrl(selectedShop.image_shop);
        console.log('Formatted image URL:', imageUrl);
        
        if (imageUrl) {
          setImagePreview(imageUrl);
          
          // Test if the image URL is accessible
          const testImg = new Image();
          testImg.onload = () => {
            console.log('Image preview loaded successfully:', imageUrl);
          };
          testImg.onerror = (e) => {
            console.error('Failed to load image preview:', imageUrl, e);
            console.log('This might be a CORS issue or incorrect URL');
          };
          testImg.src = imageUrl;
        } else {
          console.warn('formatImageUrl returned null for:', selectedShop.image_shop);
          setImagePreview(null);
        }
      } else {
        console.log('No image_shop value, clearing preview');
        //update: Clear preview if no image
        setImagePreview(null);
      }
    }
  }, [selectedShop, currentUser?.id_user, setNewShop]);

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

  const resetForm = () => {
    // Reset form to initial step
    setCurrentStep(1);
    
    // Reset shop data
    setNewShop({
      ...defaultShopValues,
      id_user: currentUser?.id_user || ''
    });
    
    // Reset image-related states
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset schedule toggle
    setHasContinuousSchedule(false);
    
    // Reset upload progress
    setUploadProgress(0);
    
    // Show info message
    setSuccess(prevSuccess => ({
      ...prevSuccess,
      shopSuccess: "El formulario está limpio."
    }));
    setShowSuccessCard(true);
    
    console.log('Form has been reset to default values');
  };

  const confirmResetForm = () => {
    // If form is empty, just reset without confirmation
    const isFormEmpty = !newShop.name_shop && 
                        !newShop.id_type && 
                        !newShop.location_shop && 
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

  // Navigation Utils
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      console.log(`Moving from step ${currentStep} to step ${currentStep + 1}`);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      console.log(`Moving from step ${currentStep} to step ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1: // Image upload - optional, so always valid
        return true;
      case 2: // Basic info
        //update: Check for id_type only, removed id_subtype check
        if (!newShop.name_shop || !newShop.id_type || !newShop.location_shop) {
          setError(prevError => ({
            ...prevError,
            shopError: "Completa todos los campos."
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      case 3: { // Schedule
        const scheduleValidation = validateSchedule(newShop);
        if (!scheduleValidation.isValid) {
          setError(prevError => ({
            ...prevError,
            shopError: scheduleValidation.error
          }));
          setShowErrorCard(true);
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  // Handle next button with validation
  const handleNextClick = () => {
    console.log("Next button clicked at step:", currentStep);
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Block direct form submission at intermediate steps
  const handleFormSubmit = async (e) => {
    // Always prevent default form submission
    e.preventDefault();

    console.log("Form submit triggered at step:", currentStep);
    
    // Only allow submission at the final step
    if (currentStep !== totalSteps) {
      console.log("Preventing submission - not at final step");
      setError(prevError => ({
        ...prevError,
        shopError: "Por favor complete todos los pasos del formulario primero."
      }));
      setShowErrorCard(true);
      
      // Instead of submitting, go to the next step
      if (validateCurrentStep()) {
        goToNextStep();
      }
      return;
    }
    
    // Now we're at the final step, proceed with submission
    await processFormSubmission(e);
  };
  
  // Extracted the actual form submission logic to a separate function
  const processFormSubmission = async (e) => {
    // Set flag to prevent duplicate submissions
    if (isFormSubmitting) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setIsFormSubmitting(true);
    console.log('Processing form submission with data:', newShop);

    if (!currentUser?.id_user) {
      console.error('No user ID available:', currentUser);
      setError(prevError => ({
        ...prevError,
        shopError: 'Error: Usuario no identificado. Por favor, inicie sesión de nuevo.'
      }));
      setShowErrorCard(true);
      setIsFormSubmitting(false);
      return;
    }

    // Disable submit button during processing
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const formData = {
        ...newShop,
        id_user: currentUser.id_user
      };
      
      // If schedule is continuous, set morning_close and afternoon_open as null
      if (hasContinuousSchedule) {
        formData.morning_close = null;
        formData.afternoon_open = null;
      }

      console.log('Submitting form with data:', formData);
      
      // One final schedule validation
      const scheduleValidation = validateSchedule(formData);
      if (!scheduleValidation.isValid) {
        setError(prevError => ({ 
          ...prevError, 
          shopError: scheduleValidation.error 
        }));
        setShowErrorCard(true);
        setIsFormSubmitting(false);
        return;
      }

      let success = false;
      let shopId = null;

      if (selectedShop) {
        // Updating existing shop
        const result = await handleUpdateShop(selectedShop.id_shop, formData);
        success = !!result;
        shopId = selectedShop.id_shop;
        
        if (success) {
          console.log('Shop updated successfully:', result);
          
          // Show success notification
          setSuccess(prevSuccess => ({
            ...prevSuccess,
            shopSuccess: "Comercio actualizado."
          }));
          setShowSuccessCard(true);
        }
      } else {
        // Creating new shop
        const result = await handleCreateShop(formData);
        success = !!result && !!result.id_shop;
        
        if (success) {
          console.log('New shop created successfully:', result);
          shopId = result.id_shop;
          
          // Show success notification
          setSuccess(prevSuccess => ({
            ...prevSuccess,
            shopSuccess: "Comercio creado."
          }));
          setShowSuccessCard(true);
        }
      }

      // Upload image if one was selected and the save operation was successful
      if (success && selectedImage && shopId) {
        console.log(`Shop ${selectedShop ? 'updated' : 'created'} successfully, ID: ${shopId}`);
        
        try {
          setUploading(true);
          await handleImageUpload(
            selectedImage, 
            shopId, 
            (progress) => setUploadProgress(progress)
          );
          console.log('Shop image uploaded successfully');
          
          // Clear the image selection after successful upload
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error uploading shop image:', error);
          setError(prevError => ({
            ...prevError,
            imageError: error.message || "Error uploading shop image"
          }));
          setShowErrorCard(true);
        } finally {
          setUploading(false);
        }
      }
      
      // If successful, start exit animation then close the form
      if (success) {
        setIsExiting(true);
        setTimeout(() => {
          setShowShopCreationForm(false);
          setSelectedShop(null);
        }, 500); // Same delay as LoginRegisterForm
      }
      
    } catch (error) {
      console.error('Error processing form:', error);
      setError(prevError => ({
        ...prevError,
        shopError: error.message || "Error processing form"
      }));
      setShowErrorCard(true);
    } finally {
      // Re-enable submit button
      if (submitButton) submitButton.disabled = false;
      setIsFormSubmitting(false);
    }
  };

  //Render the appropriate step component based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShopImageUpload 
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            uploading={uploading}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            fileInputRef={fileInputRef}
            setError={setError}
            setShowErrorCard={setShowErrorCard}
          />
        );
      case 2:
        return (
          <ShopBasicInfo 
            newShop={newShop}
            setNewShop={setNewShop}
            shopTypesAndSubtypes={shopTypesAndSubtypes}
          />
        );
      case 3:
        return (
          <ShopSchedule 
            newShop={newShop}
            setNewShop={setNewShop}
            hasContinuousSchedule={hasContinuousSchedule}
            setHasContinuousSchedule={setHasContinuousSchedule}
          />
        );
      default:
        return null;
    }
  };

  const formTransition = useTransition(!isExiting, {
    from: formAnimation.from,
    enter: formAnimation.enter,
    leave: formAnimation.leave,
    config: formAnimation.config,
    onRest: () => {
      // Animation has completed, reset exit state if needed
      // This would only run if the component is still mounted
      if (isExiting) {
        setIsExiting(false);
      }
    }
  });

  //update: Show loading state if types are being loaded
  if (typesLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingMessage}>
            Cargando tipos de comercio...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {formTransition((style, show) => 
        show && (
          <animated.div 
            className={styles.container} 
            style={style}
          >
            <div className={styles.content}>
              <div className={styles.header}>   
                <h2 className={styles.headerTitle}>
                  {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
                </h2>

                <StepTracker currentStep={currentStep} totalSteps={totalSteps} />
              </div>   
              
              {/* Use handleFormSubmit instead of handleSubmit */}
              <form onSubmit={handleFormSubmit} className={styles.form}>
                {/* Render step content */}
                {renderStepContent()}
                  
                <div className={styles.buttonsContainer}>
                  <button
                    type="button"
                    onClick={confirmResetForm}
                    className={styles.active}
                    title="Limpiar formulario"
                    disabled={uploading || isFormSubmitting}
                  >
                    <RefreshCw size={16} className={styles.resetIcon} />
                    Limpiar
                  </button>
                  
                  <NavigationButtons 
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={handleNextClick}
                    onPrevious={goToPreviousStep}
                    isSubmitting={uploading || isFormSubmitting}
                    submitLabel={selectedShop ? 'Actualizar' : 'Crear'}
                    processingLabel="Procesando..."
                    SubmitIcon={Plus}
                    // Only show submit button on the last step
                    showSubmitButton={currentStep === totalSteps}
                  />
                </div>
              </form>
            </div>
          </animated.div>
        )
      )}
    </>
  );
};

export default ShopCreationForm;