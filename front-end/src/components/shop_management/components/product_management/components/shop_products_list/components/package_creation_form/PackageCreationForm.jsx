import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../../../app_context/AuthContext.jsx';
import { useShop } from '../../../../../../../../app_context/ShopContext.jsx';
import { useProduct } from '../../../../../../../../app_context/ProductContext.jsx';
import { usePackage } from '../../../../../../../../app_context/PackageContext.jsx';
import { useUI } from '../../../../../../../../app_context/UIContext.jsx';
import PackageCreationFormUtils from './PackageCreationFormUtils.jsx';
import { useTransition, animated } from '@react-spring/web';
import { formAnimation } from '../../../../../../../../utils/animation/transitions.js';
import { ArrowLeft, PackagePlus, X, Save, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadPackageImage, formatImageUrl } from '../../../../../../../../utils/image/packageImageUploadService.js';
import { validateImageFile } from '../../../../../../../../utils/image/imageValidation.js';

import styles from '../../../../../../../../../../public/css/PackageCreationForm.module.css';

const PackageCreationForm = () => {
  const { currentUser } = useAuth();
  const { selectedShop } = useShop();
  const { 
    products,
    selectedProducts,
    setSelectedProducts,
    refreshProductList
  } = useProduct();
  const { 
    newPackageData, 
    setNewPackageData,
    setShowPackageCreationForm,
    setIsAddingPackage,
    shouldExitPackageForm,
    closePackageFormWithAnimation,
    resetPackageData,
    refreshPackageList,
    selectedPackage,
    setSelectedPackage
  } = usePackage();
  const { 
    setError, 
    error,
    setShowErrorCard,
    showErrorCard,
    setSuccess,
    setShowSuccessCard,
    setSingleSuccess,
    setSingleError,
    openImageModal
  } = useUI();

  // Local state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  //update: State for calculated prices
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  //update: Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  //update: Check if we're in edit mode
  const isEditMode = selectedPackage !== null;

  // Get utilities
  const { 
    validatePackageForm,
    handleCreatePackage,
    handleUpdatePackage,
    getProductDetails
  } = PackageCreationFormUtils();
  
  // Spring animation transitions
  const formTransition = useTransition(isVisible && !shouldExitPackageForm, {
    ...formAnimation,
    config: {
      mass: 1,
      tension: 280,
      friction: 24
    }
  });

  // Initialize form and fetch selected product details
  useEffect(() => {
    const initForm = async () => {
      try {
        //update: If in edit mode, populate form with existing package data
        if (isEditMode && selectedPackage) {
          setNewPackageData({
            id_shop: selectedPackage.id_shop,
            id_product1: selectedPackage.id_product1,
            id_product2: selectedPackage.id_product2,
            id_product3: selectedPackage.id_product3,
            id_product4: selectedPackage.id_product4,
            id_product5: selectedPackage.id_product5,
            name_package: selectedPackage.name_package || '',
            discount_package: selectedPackage.discount_package || 0,
            active_package: selectedPackage.active_package,
            image_package: selectedPackage.image_package //update: Include existing image
          });
          
          //update: Set image preview if package has an image
          if (selectedPackage.image_package) {
            const imageUrl = formatImageUrl(selectedPackage.image_package);
            setImagePreview(imageUrl);
          }
        }
        
        // Get array of selected product IDs
        const productIds = [
          newPackageData.id_product1,
          newPackageData.id_product2,
          newPackageData.id_product3,
          newPackageData.id_product4,
          newPackageData.id_product5
        ].filter(id => id !== null && id !== '');
        
        // Fetch details for selected products
        const details = await getProductDetails(productIds);
        setSelectedProductDetails(details);
        
        //update: Calculate total price
        const total = details.reduce((sum, product) => sum + (parseFloat(product.price_product) || 0), 0);
        setTotalPrice(total);
        
        //update: Calculate discounted price
        const discount = parseInt(newPackageData.discount_package) || 0;
        const discounted = total * (1 - discount / 100);
        setDiscountedPrice(discounted);
        
        // Set visibility for animation
        setIsVisible(true);
        
      } catch (error) {
        console.error('Error initializing package form:', error);
        setError(prevError => ({
          ...prevError,
          productError: "Error al inicializar el formulario de paquetes"
        }));
        setShowErrorCard(true);
      }
    };
    
    initForm();
  }, [isEditMode, selectedPackage]);
  
  // Update product details when newPackageData changes
  useEffect(() => {
    const updateProductDetails = async () => {
      // Get array of selected product IDs
      const productIds = [
        newPackageData.id_product1,
        newPackageData.id_product2,
        newPackageData.id_product3,
        newPackageData.id_product4,
        newPackageData.id_product5
      ].filter(id => id !== null && id !== '');
      
      if (productIds.length > 0) {
        // Fetch details for selected products
        const details = await getProductDetails(productIds);
        setSelectedProductDetails(details);
        
        // Calculate total price
        const total = details.reduce((sum, product) => sum + (parseFloat(product.price_product) || 0), 0);
        setTotalPrice(total);
        
        // Calculate discounted price
        const discount = parseInt(newPackageData.discount_package) || 0;
        const discounted = total * (1 - discount / 100);
        setDiscountedPrice(discounted);
      }
    };
    
    updateProductDetails();
  }, [newPackageData, getProductDetails]);
  
  //update: Handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Validate the image
      await validateImageFile(file);
      
      // Set the file and create preview
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      if (formErrors.image_package) {
        setFormErrors(prev => ({
          ...prev,
          image_package: ''
        }));
      }
    } catch (error) {
      console.error('Image validation error:', error);
      setFormErrors(prev => ({
        ...prev,
        image_package: error.message
      }));
    }
  };
  
  //update: Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };
  
  // Handle back button click
  const handleBackClick = async () => {
    // Reset form and navigate back
    try {
      await closePackageFormWithAnimation();
      setTimeout(() => {
        setIsAddingPackage(false);
        resetPackageData();
        setSelectedProducts(new Set());
        setSelectedPackage(null); //update: Clear selected package
        setImageFile(null);
        setImagePreview(null);
      }, 500);
    } catch (error) {
      console.error('Error navigating back from package form:', error);
    }
  };
  
  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setNewPackageData(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    //update: Recalculate discounted price when discount changes
    if (name === 'discount_package') {
      const discount = parseInt(value) || 0;
      const discounted = totalPrice * (1 - discount / 100);
      setDiscountedPrice(discounted);
    }
    
    // Clear error for this field if present
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form
      const validationErrors = validatePackageForm(newPackageData);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Create or update package based on mode
      let result;
      let packageId;
      
      if (isEditMode) {
        //update: Include package ID for update
        result = await handleUpdatePackage({
          ...newPackageData,
          id_package: selectedPackage.id_package
        });
        packageId = selectedPackage.id_package;
      } else {
        result = await handleCreatePackage(newPackageData);
        packageId = result.data?.id_package;
      }
      
      if (result.success) {
        //update: Upload image if one was selected
        if (imageFile && packageId) {
          try {
            setIsUploadingImage(true);
            const imagePath = await uploadPackageImage({
              file: imageFile,
              shopId: selectedShop.id_shop,
              packageId: packageId,
              onProgress: (progress) => setUploadProgress(progress),
              onError: (error) => {
                console.error('Image upload error:', error);
                setSingleError('productError', 'Error al subir la imagen del paquete');
              }
            });
            
            console.log('Package image uploaded successfully:', imagePath);
          } catch (imageError) {
            console.error('Failed to upload package image:', imageError);
            // Don't fail the entire operation if just the image upload fails
          } finally {
            setIsUploadingImage(false);
          }
        }
        
        // Show success message
        setSingleSuccess('productSuccess', isEditMode ? "Paquete actualizado exitosamente" : "Paquete creado exitosamente");
        
        // Refresh lists
        refreshPackageList();
        
        // Reset and go back
        setTimeout(async () => {
          await closePackageFormWithAnimation();
          setIsAddingPackage(false);
          resetPackageData();
          setSelectedProducts(new Set());
          setSelectedPackage(null);
          setImageFile(null);
          setImagePreview(null);
        }, 1500);
      } else {
        // Show error message
        setSingleError('productError', result.message || (isEditMode ? "Error al actualizar el paquete" : "Error al crear el paquete"));
      }
    } catch (error) {
      console.error('Error submitting package form:', error);
      setSingleError('productError', isEditMode ? "Error al actualizar el paquete" : "Error al crear el paquete");
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };
  
  // Render selected products list
  const renderSelectedProducts = () => {
    return selectedProductDetails.map((product, index) => (
      <div key={product.id_product} className={styles.selectedProductItem}>
        <span className={styles.productNumber}>{index + 1}.</span>
        <span className={styles.productName}>{product.name_product}</span>
        <span className={styles.productPrice}>€{product.price_product}</span>
      </div>
    ));
  };
  
  return formTransition((style, item) => 
    item && (
      <animated.div style={style} className={styles.formContainer}>
        <div className={styles.formHeader}>
          <button 
            onClick={handleBackClick}
            className={styles.backButton}
            type="button"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className={styles.formTitle}>
            <PackagePlus size={24} className={styles.formTitleIcon} />
            {isEditMode ? 'Editar Paquete' : 'Crear Paquete'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Selected products section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Productos Seleccionados ({selectedProductDetails.length})</h3>
            <div className={styles.selectedProductsList}>
              {selectedProductDetails.length > 0 ? (
                renderSelectedProducts()
              ) : (
                <p className={styles.noProductsMessage}>No hay productos seleccionados</p>
              )}
            </div>
          </div>
          
          {/* Package details section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Detalles del Paquete</h3>
            
            <div className={styles.formField}>
              <label htmlFor="name_package" className={styles.label}>
                Nombre del Paquete*
              </label>
              <input
                type="text"
                id="name_package"
                name="name_package"
                value={newPackageData.name_package}
                onChange={handleInputChange}
                className={`${styles.input} ${formErrors.name_package ? styles.inputError : ''}`}
                placeholder="Ingrese un nombre para el paquete"
              />
              {formErrors.name_package && (
                <span className={styles.errorText}>
                  <AlertTriangle size={14} />
                  {formErrors.name_package}
                </span>
              )}
            </div>
            
            <div className={styles.formField}>
              <label htmlFor="discount_package" className={styles.label}>
                Descuento del Paquete (%)
              </label>
              <input
                type="number"
                id="discount_package"
                name="discount_package"
                value={newPackageData.discount_package || ''}
                onChange={handleInputChange}
                className={`${styles.input} ${formErrors.discount_package ? styles.inputError : ''}`}
                placeholder="0-100"
                min="0"
                max="100"
                step="1"
              />
              {formErrors.discount_package && (
                <span className={styles.errorText}>
                  <AlertTriangle size={14} />
                  {formErrors.discount_package}
                </span>
              )}
            </div>
            
            {/* Price summary */}
            <div className={styles.priceSummary}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Precio total:</span>
                <span className={styles.priceValue}>€{totalPrice.toFixed(2)}</span>
              </div>
              {newPackageData.discount_package > 0 && (
                <>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Descuento ({newPackageData.discount_package}%):</span>
                    <span className={styles.discountValue}>-€{(totalPrice - discountedPrice).toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}><strong>Precio final:</strong></span>
                    <span className={styles.finalPriceValue}><strong>€{discountedPrice.toFixed(2)}</strong></span>
                  </div>
                </>
              )}
            </div>
            
            <div className={styles.formField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="active_package"
                  checked={newPackageData.active_package}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                Paquete activo
              </label>
            </div>
          </div>
          
          {/* Image upload section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Imagen del Paquete</h3>
            
            <div className={styles.imageUploadContainer}>
              {imagePreview ? (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={imagePreview} 
                    alt="Vista previa del paquete" 
                    className={styles.imagePreview}
                    onClick={() => openImageModal(imagePreview)}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className={styles.removeImageButton}
                    title="Eliminar imagen"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label htmlFor="packageImage" className={styles.imageUploadLabel}>
                  <input
                    type="file"
                    id="packageImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.hiddenFileInput}
                    disabled={isUploadingImage}
                  />
                  <div className={styles.uploadPlaceholder}>
                    <Upload size={40} className={styles.uploadIcon} />
                    <span className={styles.uploadText}>
                      Haga clic para seleccionar una imagen
                    </span>
                    <span className={styles.uploadHint}>
                      JPEG, PNG, WebP (máx. 10MB)
                    </span>
                  </div>
                </label>
              )}
              
              {formErrors.image_package && (
                <span className={styles.errorText}>
                  <AlertTriangle size={14} />
                  {formErrors.image_package}
                </span>
              )}
              
              {isUploadingImage && (
                <div className={styles.uploadProgress}>
                  <div 
                    className={styles.uploadProgressBar} 
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span className={styles.uploadProgressText}>
                    Subiendo imagen... {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Form actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleBackClick}
              className={`${styles.button} ${styles.cancelButton}`}
              disabled={isSubmitting || isUploadingImage}
            >
              <X size={18} />
              Cancelar
            </button>
            
            <button
              type="submit"
              className={`${styles.button} ${styles.submitButton}`}
              disabled={isSubmitting || isUploadingImage}
            >
              <Save size={18} />
              {isSubmitting ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Paquete' : 'Crear Paquete')}
            </button>
          </div>
        </form>
      </animated.div>
    )
  );
};

export default PackageCreationForm;