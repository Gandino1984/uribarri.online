import React, { useContext, useEffect, useState, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ShopCreationFormFunctions } from './ShopCreationFormFunctions.jsx';
import { Box, ArrowLeft, Camera, ImagePlus, Trash2 } from 'lucide-react';
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
    // UPDATE: Agregamos los estados necesarios para el botón volver
    setShowShopCreationForm,
    setSelectedShop,
    // UPDATE: Agregamos estados para el manejo de imágenes
    uploading,
    setUploading
  } = useContext(AppContext);

  const {
    handleCreateShop,
    handleUpdateShop,
    validateSchedule,
    // UPDATE: Añadimos la función de carga de imágenes
    handleImageUpload
  } = ShopCreationFormFunctions();

  // UPDATE: Añadimos estados para la gestión de la imagen
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

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

    // UPDATE: Establecemos la imagen previa si existe
    if (selectedShop.image_shop) {
      try {
        // Si la imagen ya es una URL completa
        if (selectedShop.image_shop.startsWith('http') || 
            selectedShop.image_shop.startsWith('data:') || 
            selectedShop.image_shop.startsWith('blob:')) {
          setImagePreview(selectedShop.image_shop);
        } else {
          // Construir la URL relativa a la base
          const baseUrl = window.location.origin;
          const cleanPath = selectedShop.image_shop.replace(/^\/+/, '');
          const imageUrl = `${baseUrl}/${cleanPath}`;
          console.log('Estableciendo URL de vista previa:', imageUrl);
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.error('Error al formatear la URL de la imagen:', err);
      }
    }
  }
}, [selectedShop, currentUser?.id_user, setNewShop]);

  // UPDATE: Manejador para seleccionar imagen
  const handleImageSelect = (e) => {
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
  };

  // UPDATE: Función para limpiar la imagen seleccionada
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      console.log('Submitting form with data:', formData);
      
      // Validate schedule
      const scheduleValidation = validateSchedule(newShop);
      
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
        const result = await handleUpdateShop(selectedShop.id_shop, newShop);
        success = !!result;
        shopId = selectedShop.id_shop;
        
        if (success) {
          console.log('Tienda actualizada exitosamente:', result);
          createdOrUpdatedShop = result;
        }
      } else {
        // Creating new shop
        const result = await handleCreateShop(newShop);
        success = !!result && !!result.id_shop;
        
        if (success) {
          console.log('Nueva tienda creada exitosamente:', result);
          shopId = result.id_shop;
          createdOrUpdatedShop = result;
          
          // Force update the shops list in AppContext immediately
          // This is critical for ensuring the new shop appears in the list
          console.log('Actualizando la lista de tiendas con la nueva tienda creada');
        }
      }

      // UPDATE: Subir imagen si se seleccionó una y la operación de guardar fue exitosa
      if (success && selectedImage && shopId) {
        console.log(`Comercio ${selectedShop ? 'actualizado' : 'creado'} con éxito, ID: ${shopId}`);
        
        try {
          setUploading(true);
          await handleImageUpload(
            selectedImage, 
            shopId, 
            (progress) => setUploadProgress(progress)
          );
          console.log('Imagen de comercio subida con éxito');
          
          // Clear the image selection after successful upload
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error al subir imagen del comercio:', error);
          setError(prevError => ({
            ...prevError,
            imageError: error.message || "Error al subir la imagen del comercio"
          }));
          setShowErrorCard(true);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      setError(prevError => ({
        ...prevError,
        shopError: error.message || "Error al procesar el formulario"
      }));
      setShowErrorCard(true);
    } finally {
      // Re-enable submit button
      if (submitButton) submitButton.disabled = false;
    }
  };

  // UPDATE: Función para manejar el botón volver
  const handleBack = () => {
    // Limpiar el estado del formulario
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
    
    // Limpiar la tienda seleccionada
    setSelectedShop(null);
    
    // Ocultar el formulario para volver a la lista
    setShowShopCreationForm(false);
  };

  // Get the list of shop types
  const shopTypes = Object.keys(shopTypesAndSubtypes);
  const subtypes = newShop.type_shop ? shopTypesAndSubtypes[newShop.type_shop] : [];

  return (
    <animated.div style={formAnimation} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>   
          {/* UPDATE: Agregamos el botón de volver */}
          <button 
            onClick={handleBack}
            className={styles.backButton}
            title="Volver a la lista de comercios"
          >
            <ArrowLeft size={20} />
          </button>
          <h3 className={styles.headerTitle}>
            {selectedShop ? 'Actualizar comercio' : 'Crear un comercio'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
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

            {/* UPDATE: Añadimos la sección de carga de imagen */}
            <div className={styles.formField}>
              <div className={styles.imageUploadContainer || styles.formField}>
                <label className={styles.imageUploadLabel || styles.fieldLabel}>
                  Imagen del Comercio
                </label>
                
                <div className={styles.imagePreviewBox || styles.previewContainer} style={{
                  width: '100%',
                  height: '180px',
                  border: '1px dashed #ccc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '10px',
                  backgroundColor: '#f5f5f5'
                }}>
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Vista previa de imagen" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
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
                      <span>Sin imagen seleccionada</span>
                    </div>
                  )}
                  
                  {uploading && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '5px',
                      color: 'white',
                    }}>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px' }}>
                        <div 
                          style={{ 
                            width: `${uploadProgress}%`,
                            height: '100%',
                            backgroundColor: '#4CAF50',
                            borderRadius: '4px'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '2px' }}>
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginBottom: '10px',
                  flexWrap: 'wrap'
                }}>
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
                    className={styles.imageButton || styles.submitButton}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      opacity: uploading ? 0.6 : 1,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      padding: '8px 15px',
                      backgroundColor: '#4A90E2',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <Camera size={16} />
                    Seleccionar imagen
                  </label>
                  
                  {selectedImage && (
                    <button
                      type="button"
                      className={styles.clearImageButton || styles.submitButton}
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
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.6 : 1,
                        fontSize: '14px'
                      }}
                    >
                      <Trash2 size={16} />
                      Quitar imagen
                    </button>
                  )}
                </div>
                
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '0'
                }}>
                  {selectedShop 
                    ? "La imagen se actualizará al guardar cambios" 
                    : "La imagen se subirá al crear el comercio"}
                  <br/>
                  Formatos aceptados: JPG, PNG, WebP. Tamaño máx: 5MB
                </p>
              </div>
            </div>
          </div>

          <div className={styles.scheduleContainer}>
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