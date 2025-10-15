// front-end/src/components/shop_management/components/product_management/components/product_creation_form/components/shops_packages_list/components/package_creation_form/PackageCreationForm.jsx
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
import { uploadPackageImage, formatImageUrl } from '../../../../../../../../utils/image/imageUploadService.js';
import { validateImageFile } from '../../../../../../../../utils/image/imageValidation.js';
import { optimizeImage } from '../../../../../../../../utils/image/imageOptimizer.js';
import axiosInstance from '../../../../../../../../utils/app/axiosConfig.js';

import styles from '../../../../../../../../../css/PackageCreationForm.module.css';

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
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
        if (isEditMode && selectedPackage) {
          const packageData = {
            id_shop: selectedPackage.id_shop,
            id_product1: selectedPackage.id_product1 || '',
            id_product2: selectedPackage.id_product2 || null,
            id_product3: selectedPackage.id_product3 || null,
            id_product4: selectedPackage.id_product4 || null,
            id_product5: selectedPackage.id_product5 || null,
            name_package: selectedPackage.name_package || '',
            discount_package: selectedPackage.discount_package || 0,
            active_package: selectedPackage.active_package !== undefined ? selectedPackage.active_package : true,
            image_package: selectedPackage.image_package || null
          };
          
          setNewPackageData(packageData);
          
          if (selectedPackage.image_package) {
            const imageUrl = formatImageUrl(selectedPackage.image_package);
            setImagePreview(imageUrl);
          }
          
          const productIds = [
            selectedPackage.id_product1,
            selectedPackage.id_product2,
            selectedPackage.id_product3,
            selectedPackage.id_product4,
            selectedPackage.id_product5
          ].filter(id => id !== null && id !== undefined && id !== '');
          
          if (productIds.length > 0) {
            const details = await getProductDetails(productIds);
            setSelectedProductDetails(details);
            
            const total = details.reduce((sum, product) => {
              if (product && product.price_product) {
                return sum + (parseFloat(product.price_product) || 0);
              }
              return sum;
            }, 0);
            setTotalPrice(total);
            
            const discount = parseInt(selectedPackage.discount_package) || 0;
            const discounted = total * (1 - discount / 100);
            setDiscountedPrice(discounted);
          }
        } else {
          const productIds = [
            newPackageData.id_product1,
            newPackageData.id_product2,
            newPackageData.id_product3,
            newPackageData.id_product4,
            newPackageData.id_product5
          ].filter(id => id !== null && id !== undefined && id !== '');
          
          if (productIds.length > 0) {
            const details = await getProductDetails(productIds);
            setSelectedProductDetails(details);
            
            const total = details.reduce((sum, product) => {
              if (product && product.price_product) {
                return sum + (parseFloat(product.price_product) || 0);
              }
              return sum;
            }, 0);
            setTotalPrice(total);
            
            const discount = parseInt(newPackageData.discount_package) || 0;
            const discounted = total * (1 - discount / 100);
            setDiscountedPrice(discounted);
          }
        }
        
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
  
  useEffect(() => {
    if (isEditMode && selectedProductDetails.length === 0) {
      return;
    }
    
    const updateProductDetails = async () => {
      const productIds = [
        newPackageData.id_product1,
        newPackageData.id_product2,
        newPackageData.id_product3,
        newPackageData.id_product4,
        newPackageData.id_product5
      ].filter(id => id !== null && id !== undefined && id !== '');
      
      if (productIds.length > 0) {
        const details = await getProductDetails(productIds);
        
        if (details && details.length > 0) {
          setSelectedProductDetails(details);
          
          const total = details.reduce((sum, product) => {
            if (product && product.price_product) {
              return sum + (parseFloat(product.price_product) || 0);
            }
            return sum;
          }, 0);
          setTotalPrice(total);
          
          const discount = parseInt(newPackageData.discount_package) || 0;
          const discounted = total * (1 - discount / 100);
          setDiscountedPrice(discounted);
        }
      } else {
        setSelectedProductDetails([]);
        setTotalPrice(0);
        setDiscountedPrice(0);
      }
    };
    
    updateProductDetails();
  }, [newPackageData.id_product1, newPackageData.id_product2, newPackageData.id_product3, 
      newPackageData.id_product4, newPackageData.id_product5, newPackageData.discount_package,
      getProductDetails]);
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await validateImageFile(file);
      
      let optimizedFile = file;
      try {
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          format: 'image/webp',
          maxSizeKB: 1024
        });
        console.log('Package image optimized client-side:', {
          originalSize: Math.round(file.size / 1024) + 'KB',
          optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
        });
      } catch (optimizeError) {
        console.warn('Client-side optimization failed, will use original:', optimizeError);
      }
      
      setImageFile(optimizedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(optimizedFile);
      
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
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };
  
  const handleBackClick = async () => {
    try {
      await closePackageFormWithAnimation();
      setTimeout(() => {
        setIsAddingPackage(false);
        resetPackageData();
        setSelectedProducts(new Set());
        setSelectedPackage(null);
        setImageFile(null);
        setImagePreview(null);
      }, 500);
    } catch (error) {
      console.error('Error navigating back from package form:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setNewPackageData(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    if (name === 'discount_package') {
      const discount = parseInt(value) || 0;
      const discounted = totalPrice * (1 - discount / 100);
      setDiscountedPrice(discounted);
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  //update: Completely rewritten submit handler with proper error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      console.log('=== PACKAGE FORM SUBMISSION STARTED ===');
      console.log('Current package data:', newPackageData);
      console.log('Selected shop:', selectedShop);
      console.log('Is edit mode:', isEditMode);
      console.log('Image file selected:', !!imageFile);
      
      // Validate form
      const validationErrors = validatePackageForm(newPackageData);
      if (Object.keys(validationErrors).length > 0) {
        console.error('Validation errors:', validationErrors);
        setFormErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      let result;
      let packageId;
      let uploadedImagePath = null;
      
      // EDIT MODE: Handle updates differently
      if (isEditMode) {
        console.log('--- EDIT MODE: Updating existing package ---');
        
        // If there's a new image, upload it with the existing package ID
        if (imageFile) {
          try {
            setIsUploadingImage(true);
            console.log('Uploading new image for existing package:', selectedPackage.id_package);
            
            uploadedImagePath = await uploadPackageImage({
              file: imageFile,
              shopId: selectedShop.id_shop,
              packageId: selectedPackage.id_package,
              onProgress: (progress) => setUploadProgress(progress),
              onError: (error) => {
                console.error('Image upload error:', error);
                setSingleError('productError', 'Error al subir la imagen del paquete');
              }
            });
            
            console.log('✓ Image uploaded successfully:', uploadedImagePath);
            setIsUploadingImage(false);
          } catch (imageError) {
            console.error('✗ Failed to upload package image:', imageError);
            setIsUploadingImage(false);
            // Continue with update even if image upload fails
          }
        }
        
        // Update the package
        result = await handleUpdatePackage({
          ...newPackageData,
          id_package: selectedPackage.id_package,
          image_package: uploadedImagePath || newPackageData.image_package
        });
        
        packageId = selectedPackage.id_package;
        
      } else {
        // CREATE MODE: New package creation
        console.log('--- CREATE MODE: Creating new package ---');
        
        // Step 1: Create package WITHOUT image first
        const createData = {
          id_shop: selectedShop.id_shop,
          id_product1: newPackageData.id_product1,
          id_product2: newPackageData.id_product2 || null,
          id_product3: newPackageData.id_product3 || null,
          id_product4: newPackageData.id_product4 || null,
          id_product5: newPackageData.id_product5 || null,
          name_package: newPackageData.name_package,
          discount_package: newPackageData.discount_package || 0,
          image_package: null, // Will be updated after upload
          active_package: newPackageData.active_package !== undefined ? newPackageData.active_package : true
        };
        
        console.log('Creating package with data:', createData);
        result = await handleCreatePackage(createData);
        
        if (!result.success) {
          console.error('✗ Package creation failed:', result.message);
          setSingleError('productError', result.message || "Error al crear el paquete");
          setIsSubmitting(false);
          return;
        }
        
        packageId = result.data?.id_package;
        console.log('✓ Package created successfully with ID:', packageId);
        
        // Step 2: If there's an image and we have the package ID, upload it
        if (imageFile && packageId) {
          try {
            setIsUploadingImage(true);
            console.log('Uploading image for new package ID:', packageId);
            
            uploadedImagePath = await uploadPackageImage({
              file: imageFile,
              shopId: selectedShop.id_shop,
              packageId: packageId,
              onProgress: (progress) => setUploadProgress(progress),
              onError: (error) => {
                console.error('Image upload error:', error);
              }
            });
            
            console.log('✓ Image uploaded successfully:', uploadedImagePath);
            setIsUploadingImage(false);
            
            // Step 3: Update the package with the image path
            console.log('Updating package with image path...');
            await axiosInstance.patch('/package/update', {
              id_package: packageId,
              image_package: uploadedImagePath
            });
            console.log('✓ Package updated with image path');
            
          } catch (imageError) {
            console.error('✗ Failed to upload/update package image:', imageError);
            setIsUploadingImage(false);
            console.warn('Package created but without image');
            // Don't fail the whole operation if image upload fails
          }
        }
      }
      
      // Show success message
      if (result.success) {
        console.log('✓ Package operation successful!');
        
        setSingleSuccess('productSuccess', isEditMode ? "Paquete actualizado exitosamente" : "Paquete creado exitosamente");
        
        refreshPackageList();
        
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
        console.error('✗ Package operation failed:', result.message);
        setSingleError('productError', result.message || (isEditMode ? "Error al actualizar el paquete" : "Error al crear el paquete"));
      }
      
    } catch (error) {
      console.error('=== EXCEPTION IN handleSubmit ===');
      console.error('Error:', error);
      setSingleError('productError', isEditMode ? "Error al actualizar el paquete" : "Error al crear el paquete");
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
      console.log('=== PACKAGE FORM SUBMISSION ENDED ===');
    }
  };
  
  const renderSelectedProducts = () => {
    const validProducts = selectedProductDetails.filter(product => 
      product && product.id_product && product.name_product
    );
    
    if (validProducts.length === 0) {
      return (
        <p className={styles.noProductsMessage}>
          No se pudieron cargar los detalles de los productos
        </p>
      );
    }
    
    return validProducts.map((product, index) => (
      <div key={product.id_product} className={styles.selectedProductItem}>
        <span className={styles.productNumber}>{index + 1}.</span>
        <span className={styles.productName}>{product.name_product || 'Producto sin nombre'}</span>
        <span className={styles.productPrice}>
          €{product.price_product ? parseFloat(product.price_product).toFixed(2) : '0.00'}
        </span>
      </div>
    ));
  };
  
  return formTransition((style, item) => 
    item && (
      <animated.div style={style} className={styles.formContainer}>
        <div className={styles.formHeader}>
          <button 
            onClick={handleBackClick}
            className={styles.button}
            type="button"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <p className={styles.formTitle}>
            {isEditMode ? 'Editar Paquete' : 'Crear Paquete'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Selected products section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              Productos Seleccionados ({selectedProductDetails.filter(p => p && p.id_product).length})
            </h3>
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
                Nombre del Paquete
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
              disabled={isSubmitting || isUploadingImage}
            >
              <X size={18} />
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || selectedProductDetails.filter(p => p && p.id_product).length === 0}
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