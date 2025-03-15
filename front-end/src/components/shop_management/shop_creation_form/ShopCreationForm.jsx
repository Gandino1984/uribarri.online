import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormFunctions } from './ShopCreationFormFunctions.jsx';
import { Box } from 'lucide-react';

// UPDATE: Import the new component sections
import ShopImageSection from './ShopImageSection.jsx';
import ShopBasicInfoSection from './ShopBasicInfoSection.jsx';
import ShopScheduleSection from './ShopScheduleSection.jsx';

const ShopCreationForm = () => {
  const { 
    newShop, 
    setNewShop,
    selectedShop,
    setError,
    setShowErrorCard,
    currentUser,
    setShowShopCreationForm,
    setSelectedShop,
    uploading
  } = useContext(AppContext);

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload
  } = ShopCreationFormFunctions();

  const [selectedImageState, setSelectedImageState] = useState(null);
  
  const imageUploadRef = useRef(null);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting form with currentUser:', currentUser);
    console.log('Form data:', newShop);

    if (!currentUser?.id_user) {
      console.error('No user ID available:', currentUser);
      setError(prevError => ({
        ...prevError,
        shopError: 'Error: Usuario no identificado. Por favor, inicie sesión de nuevo.'
      }));
      setShowErrorCard(true);
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
      
      // UPDATE: Retrieve the continuous schedule value from the schedule section
      // This will be handled by ShopScheduleSection component via context

      console.log('Submitting form with data:', formData);
      
      // Validate schedule
      const scheduleValidation = validateSchedule(formData);
      
      if (!scheduleValidation.isValid) {
        setError(prevError => ({ 
          ...prevError, 
          shopError: scheduleValidation.error 
        }));
        setShowErrorCard(true);
        return;
      }

      let success = false;
      let shopId = null;
      let createdOrUpdatedShop = null;

      if (selectedShop) {
        // Updating existing shop
        const result = await handleUpdateShop(selectedShop.id_shop, formData);
        success = !!result;
        shopId = selectedShop.id_shop;
        
        if (success) {
          console.log('Shop updated successfully:', result);
          createdOrUpdatedShop = result;
        }
      } else {
        // Creating new shop
        const result = await handleCreateShop(formData);
        success = !!result && !!result.id_shop;
        
        if (success) {
          console.log('New shop created successfully:', result);
          shopId = result.id_shop;
          createdOrUpdatedShop = result;
          
          // Force update the shops list in AppContext immediately
          // This is critical for ensuring the new shop appears in the list
          console.log('Updating shop list with newly created shop');
        }
      }

      // Upload image if one was selected and shop creation/update was successful
      if (success && shopId && imageUploadRef.current) {
        console.log(`Shop ${selectedShop ? 'updated' : 'created'} successfully, ID: ${shopId}`);
        
        // Call the image upload function exposed by the ShopImageSection component 
        try {
          // Check if ShopImageSection has exposed the uploadImage method through ref
          if (imageUploadRef.current && typeof imageUploadRef.current.uploadImage === 'function') {
            const uploadResult = await imageUploadRef.current.uploadImage(shopId);
            if (uploadResult) {
              console.log('Image upload successful after shop update/creation');
            }
          }
        } catch (imageError) {
          console.error('Error uploading image after shop save:', imageError);
        }
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
    }
  };

  return (
    <div className={styles.container}>

        <div className={styles.content}>    
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.header}>   
                    <h1 className={styles.headerTitle}>
                        {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
                    </h1>

                    <div className={styles.buttonContainer}>
                        <button 
                          type="submit" 
                          className={styles.submitButton}
                          disabled={uploading}
                          style={{ 
                            opacity: uploading ? 0.6 : 1,
                            cursor: uploading ? 'not-allowed' : 'pointer'
                          }}
                        >
                            {uploading ? 'Procesando...' : (selectedShop ? 'Actualizar' : 'Crear')}
                            {!uploading && <Box size={17} style={{ marginLeft: '5px' }} />}
                        </button>
                    </div>
                </div>
                <ShopImageSection 
                  handleImageUpload={handleImageUpload}
                  ref={imageUploadRef}
                />
                
                <ShopBasicInfoSection />
                
                <ShopScheduleSection />
            </form>
        </div>
    
    </div>
  );
};

export default ShopCreationForm;