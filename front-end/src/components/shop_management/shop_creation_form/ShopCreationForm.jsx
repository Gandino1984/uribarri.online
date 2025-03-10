import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormFunctions } from './ShopCreationFormFunctions.jsx';
import { Box, ArrowLeft, Camera, ImagePlus, Trash2, Clock, Loader } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

const ShopCreationForm = () => {
  const { 
    newShop, 
    setNewShop,
    shopTypesAndSubtypes,
    selectedShop,
    setError,
    setShowErrorCard,
    currentUser,
    setShowShopCreationForm,
    setSelectedShop,
    uploading,
    setUploading
  } = useContext(AppContext);

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    handleImageUpload
  } = ShopCreationFormFunctions();

  // UPDATE: Enhanced image handling states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageUploadButton, setShowImageUploadButton] = useState(false);
  const fileInputRef = useRef(null);
  
  // UPDATE: Added state for continuous schedule
  const [hasContinuousSchedule, setHasContinuousSchedule] = useState(false);

  // Animation configuration
  const formAnimation = useSpring({
    from: { 
      transform: 'translateY(35%)',
      opacity: 0
    },
    to: { 
      transform: 'translateY(0%)',
      opacity: 1
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 22
    }
  });

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
      // UPDATE: Detect if shop has continuous schedule
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
        afternoon_close: selectedShop.afternoon_close || ''
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
    }
  }, [selectedShop, currentUser?.id_user, setNewShop]);

  // UPDATE: Image container click handler - toggles upload button visibility
  const handleImageContainerClick = () => {
    setShowImageUploadButton(prev => !prev);
  };

  // UPDATE: Handle file selection and preview
  const handleImageSelect = (e) => {
    e.stopPropagation(); // Prevent container click event
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(prevError => ({
        ...prevError,
        imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
      }));
      setShowErrorCard(true);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 5MB."
      }));
      setShowErrorCard(true);
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Hide the upload button after selection
    setShowImageUploadButton(false);
  };

  // UPDATE: Function to clear the selected image
  const handleClearImage = (e) => {
    e.stopPropagation(); // Prevent container click event
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // UPDATE: Function to handle schedule type change
  const handleScheduleTypeChange = (e) => {
    const isContinuous = e.target.checked;
    setHasContinuousSchedule(isContinuous);
    
    if (isContinuous) {
      // If changed to continuous schedule, clear morning closing and afternoon opening fields
      setNewShop(prev => ({
        ...prev,
        morning_close: '',
        afternoon_open: ''
      }));
    }
  };

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
      
      // UPDATE: If schedule is continuous, set morning_close and afternoon_open as null
      if (hasContinuousSchedule) {
        formData.morning_close = null;
        formData.afternoon_open = null;
      }

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

  // UPDATE: Function to handle back button
  const handleBack = () => {
    // Clear form state
    setNewShop({
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
    });
    
    // Clear selected shop
    setSelectedShop(null);
    
    // Hide form to return to list
    setShowShopCreationForm(false);
  };

  // Get the list of shop types
  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  return (
    <animated.div style={formAnimation} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>   
          <h1 className={styles.headerTitle}>
            {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
          </h1>
        </div>
        
        {/* UPDATE: Restructured form with 3 sections for desktop layout */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* SECTION 1: Image Upload */}
          <div className={styles.imageSection}>
            {/* UPDATE: Improved image upload UI based on ShopCoverImage */}
            <div 
              className={styles.imageUploadContainer}
              onClick={handleImageContainerClick}
            >
              <div className={styles.imagePreviewBox} style={{
                width: '100%',
                height: '200px',
                border: '1px dashed #ccc',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer'
              }}>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Vista previa de imagen" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#666'
                  }}>
                    <ImagePlus size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <span>Imagen de comercio</span>
                  </div>
                )}
                
                {/* Upload progress indicator */}
                {uploading && (
                  <div className={styles.loaderOverlay} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    borderRadius: '8px'
                  }}>
                    <Loader size={32} color="white" className={styles.spinningLoader} style={{
                      animation: 'spin 1.5s linear infinite',
                      marginBottom: '15px'
                    }} />
                    
                    <div style={{ width: '80%', height: '8px', backgroundColor: '#333', borderRadius: '4px' }}>
                      <div style={{ 
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <span style={{ color: 'white', marginTop: '8px' }}>
                      {uploadProgress}%
                    </span>
                  </div>
                )}
                
                {/* Image upload button */}
                {showImageUploadButton && !uploading && (
                  <div 
                    className={styles.uploadButtonOverlay}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.7)'
                    }}
                  >
                    <input
                      type="file"
                      id="shop_image"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                    
                    <label 
                      htmlFor="shop_image" 
                      className={styles.imageButton}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '8px 15px',
                        backgroundColor: '#4A90E2',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <Camera size={16} />
                      {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </label>
                    
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        disabled={uploading}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#E25549',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 15px',
                          marginLeft: '10px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <Trash2 size={16} />
                        Quitar
                      </button>
                    )}
                  </div>
                )}
                
                {/* Edit overlay hint */}
                {!showImageUploadButton && !uploading && (
                  <div className={styles.editOverlay} style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    <Camera size={18} />
                    <span>{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* SECTION 2: Basic Shop Information */}
          <div className={styles.formFields}>
            <div className={styles.formField}>
              <input
                type="text"
                placeholder='Nombre del comercio:'
                value={newShop.name_shop}
                onChange={(e) => setNewShop({...newShop, name_shop: e.target.value})}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.formField}>
              <select
                value={newShop.type_shop}
                onChange={(e) => {
                  setNewShop({
                    ...newShop, 
                    type_shop: e.target.value,
                    subtype_shop: ''
                  })
                }}
                className={styles.input} 
                required
              >
                <option value="" disabled>Categoría</option>
                {shopTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {newShop.type_shop && (
              <div className={styles.formField}>
                <select
                  value={newShop.subtype_shop}
                  onChange={(e) => setNewShop({...newShop, subtype_shop: e.target.value})}
                  className={styles.input} 
                  required
                >
                  <option value="" disabled>Subcategoría</option>
                  {subtypes.map(subtype => (
                    <option key={subtype} value={subtype}>{subtype}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className={styles.formField}>
              <input
                type="text"
                placeholder='Dirección del comercio:'
                value={newShop.location_shop}
                onChange={(e) => setNewShop({...newShop, location_shop: e.target.value})}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* SECTION 3: Additional Information (Schedule) */}
          <div className={styles.scheduleContainer}>
            {/* Toggle for continuous or split schedule */}
            <div className={styles.scheduleTypeToggle} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              gap: '8px'
            }}>
              <input 
                type="checkbox"
                id="continuous-schedule"
                checked={hasContinuousSchedule}
                onChange={handleScheduleTypeChange}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="continuous-schedule" style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.9rem',
                color: '#444'
              }}>
                <Clock size={16} />
                Horario continuo (sin periodo de descanso)
              </label>
            </div>
          
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {hasContinuousSchedule ? (
                // Continuous schedule: only show opening and closing
                <div className={styles.scheduleSimple} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <h4 className={styles.scheduleTitle}>Horario de apertura y cierre</h4>
                  <div className={styles.scheduleFields}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#555' }}>Abre:</label>
                      <input
                        type="time"
                        value={newShop.morning_open || ''}
                        onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#555' }}>Cierra:</label>
                      <input
                        type="time"
                        value={newShop.afternoon_close || ''}
                        onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Schedule with rest period: show all 4 fields
                <>
                  <div>
                    <h4 className={styles.scheduleTitle}>Horario de la mañana</h4>
                    <div className={styles.scheduleFields}>
                      <input
                        type="time"
                        value={newShop.morning_open || ''}
                        onChange={(e) => setNewShop({...newShop, morning_open: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={newShop.morning_close || ''}
                        onChange={(e) => setNewShop({...newShop, morning_close: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className={styles.scheduleTitle}>Horario de la tarde</h4>
                    <div className={styles.scheduleFields}>
                      <input
                        type="time"
                        value={newShop.afternoon_open || ''}
                        onChange={(e) => setNewShop({...newShop, afternoon_open: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={newShop.afternoon_close || ''}
                        onChange={(e) => setNewShop({...newShop, afternoon_close: e.target.value})}
                        className={styles.timeInput}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
            
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
        </form>
      </div>
    </animated.div>
  );
};

export default ShopCreationForm;