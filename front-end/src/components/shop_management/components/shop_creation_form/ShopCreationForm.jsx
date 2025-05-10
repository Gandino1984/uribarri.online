import { useEffect, useState, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';
import styles from '../../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormUtils } from './ShopCreationFormUtils.jsx';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../app_context/AuthContext.jsx';
import { useUI } from '../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../app_context/ShopContext.jsx';
import { formAnimation } from '../../../../utils/animation/transitions.js'; // ✨ UPDATE: Using the unified formAnimation

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
    // setInfo,
    // setShowInfoCard,
    // 🔄 UPDATE: Added modal state and message setters for confirmation
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
    // ✨ UPDATE: Get notifyFormExit function from ShopContext if it exists
    // This will be implemented in ShopContext to allow controlled exit animations
    // notifyFormExit
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
  
  // 🔄 UPDATE: Added state to track if form reset is pending
  const [isResetPending, setIsResetPending] = useState(false);
  
  // ✨ UPDATE: Added state to handle animation when component exits - same as LoginRegisterForm
  const [isExiting, setIsExiting] = useState(false);
  
  
  // const handleCloseForm = () => {
  //   setIsExiting(true);
  //   setTimeout(() => {
  //     setShowShopCreationForm(false);
  //     setSelectedShop(null);
  //   }, 500); 
  // };

  // 🧹 UPDATE: Default shop values for form reset
  const defaultShopValues = {
    name_shop: '',
    type_shop: '',
    subtype_shop: '',
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

  // Modified useEffect to properly handle user ID
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
      // Detect if shop has continuous schedule
      const shopHasContinuousSchedule = !selectedShop.morning_close || !selectedShop.afternoon_open;
      setHasContinuousSchedule(shopHasContinuousSchedule);
      
      setNewShop({
        name_shop: selectedShop.name_shop,
        type_shop: selectedShop.type_shop,
        subtype_shop: selectedShop.subtype_shop,
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

      // Set image preview if exists
      if (selectedShop.image_shop) {
        try {
          // If the image is already a complete URL
          if (selectedShop.image_shop.startsWith('http') || 
              selectedShop.image_shop.startsWith('data:') || 
              selectedShop.image_shop.startsWith('blob:')) {
            setImagePreview(selectedShop.image_shop);
          } else {
            // Build the relative URL to the base
            const baseUrl = window.location.origin;
            const cleanPath = selectedShop.image_shop.replace(/^\/+/, '');
            const imageUrl = `${baseUrl}/${cleanPath}`;
            console.log('Setting preview URL:', imageUrl);
            setImagePreview(imageUrl);
          }
        } catch (err) {
          console.error('Error formatting image URL:', err);
        }
      }
      
      // Log the schedule data to ensure it's loaded correctly
      console.log('Shop schedule data loaded:', {
        morning_open: selectedShop.morning_open,
        morning_close: selectedShop.morning_close,
        afternoon_open: selectedShop.afternoon_open,
        afternoon_close: selectedShop.afternoon_close,
        hasContinuousSchedule: shopHasContinuousSchedule
      });
    }
  }, [selectedShop, currentUser?.id_user, setNewShop]);

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

  // 🧹 UPDATE: Function to reset the form
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

  // 🔄 UPDATE: Updated confirmation method to use modal dialog
  const confirmResetForm = () => {
    // If form is empty, just reset without confirmation
    const isFormEmpty = !newShop.name_shop && 
                        !newShop.type_shop && 
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
        if (!newShop.name_shop || !newShop.type_shop || !newShop.subtype_shop || !newShop.location_shop) {
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
      // let createdOrUpdatedShop = null;

      if (selectedShop) {
        // Updating existing shop
        const result = await handleUpdateShop(selectedShop.id_shop, formData);
        success = !!result;
        shopId = selectedShop.id_shop;
        
        if (success) {
          console.log('Shop updated successfully:', result);
          // createdOrUpdatedShop = result;
          
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
          // createdOrUpdatedShop = result;
          
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
        // ✨ UPDATE: Trigger exit animation first, then close form after animation completes
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

  // ✨ UPDATE: Setup form animation using unified formAnimation
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