import React, { useContext, useEffect, useState, useRef } from 'react';
import ProductCreationFormFunctions from './ProductCreationFormFunctions.jsx';
import AppContext from '../../../../app_context/AppContext';
import styles from '../../../../../../public/css/ProductCreationForm.module.css';
import { CirclePlus, ScrollText, PackagePlus, Save, AlertCircle, Camera, ImagePlus, Trash2, ArrowLeft } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';
import CustomNumberInput from '../../../custom_number_input/CustomNumberInput';
import { countries } from '../../../../../src/utils/app/countries.js';
import { formatImageUrl } from '../../../../utils/image/imageUploadService.js';

const ProductCreationForm = () => {
  const {
    handleChange,
    handleNumericInputChange,
    resetNewProductData,
    handleSubmit,
    handleUpdate,
    productCount,
    productLimit,
    fetchProductsByShop,
    handleImageUpload
  } = ProductCreationFormFunctions();

  const { 
    newProductData: productData,
    filterOptions,
    setShowProductManagement,
    isUpdatingProduct,
    setIsUpdatingProduct,
    selectedProductToUpdate,
    setSelectedProductToUpdate,
    productTypesAndSubtypes,
    setNewProductData,
    currentUser,
    selectedShop,
    shopToProductTypesMap,
    uploading,
    setError,
    setUploading,
    refreshProductList
  } = useContext(AppContext);

  // New state for image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Animation configuration
  const formAnimation = useSpring({
    from: { 
      opacity: 0,
      transform: 'translateY(40px)'
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0px)'
    },
    config: {
      mass: 1,
      tension: 280,
      friction: 20
    }
  });

  // Get available product types based on shop type
  const availableProductTypes = selectedShop?.type_shop 
    ? shopToProductTypesMap[selectedShop.type_shop] || []
    : [];

  // Filter product types based on the shop type
  const filteredProductTypes = availableProductTypes.length > 0
    ? availableProductTypes
    : Object.keys(productTypesAndSubtypes);

  // Get subtypes based on selected product type
  const subtypes = productData.type_product ? productTypesAndSubtypes[productData.type_product] : [];

  // Handle image selection
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
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 5MB."
      }));
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

  // Clear image selection
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
  }, [isUpdatingProduct, selectedProductToUpdate]);

  // Load products when selected shop changes
  useEffect(() => {
    if (selectedShop?.id_shop) {
      fetchProductsByShop();
    }
  }, [selectedShop]);

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

  // UPDATE: Corrected handleViewProductList function
  const handleViewProductList = () => {
    console.log('Returning to product list from ProductCreationForm');
    
    // First reset product-related states
    setIsUpdatingProduct(false);
    setSelectedProductToUpdate(null);
    
    // Then set showProductManagement to ensure ProductManagement renders ShopProductsList
    setShowProductManagement(true);
    
    console.log('Navigation back to product list complete');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
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
        handleClearImage();
        
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
          <AlertCircle size={16} color={statusColor} />
          <span>Límite de productos: {productCount} de {productLimit}</span>
        </div>
        {!currentUser?.category_user && productCount >= productLimit * 0.7 && (
          <p className={styles.upgradeMessage}>
            Conviértete en sponsor para aumentar tu límite a 100 productos.
          </p>
        )}
      </div>
    );
  };

  return (
    <animated.div style={formAnimation} className={styles.container}>
      <div className={styles.header}>
        <button 
          type="button" 
          className={styles.backButton}
          onClick={handleViewProductList}
          title="Volver a la lista de productos"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h2 className={styles.formTitle}>
          {selectedProductToUpdate ? 'Actualizar Producto' : 'Crear un nuevo producto'}
        </h2>
      </div>
      
      {/* Product limit information */}
      {renderProductLimitInfo()}
      
      {/* Shop type guidance */}
      {selectedShop && !selectedProductToUpdate && (
        <div className={styles.shopTypeGuidance}>
          <p>Tienda de tipo: <strong>{selectedShop.type_shop}</strong></p>
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className={styles.form}>
        <div className={styles.formField}>
          <input
            type="text"
            id="name_product"
            name="name_product"
            placeholder='Nombre del Producto:'
            value={productData.name_product}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className={styles.formField}>
          <label htmlFor="price_product">Precio</label>
          <CustomNumberInput
            label="Precio"
            name="price_product"
            value={productData.price_product}
            onChange={handleNumericInputChange}
            step={0.1}
            min={0}
            required
          />
        </div>

        <div className={styles.formField}>
          <textarea
            id="info_product"
            name="info_product"
            value={productData.info_product}
            onChange={handleChange}
            rows="4"
            width="100%"
            placeholder='Información adicional del producto. Usa palabras claves como: tallas, colección, materiales, procedencia, etc.'
          />
        </div>

        {/* Image upload section */}
        <div className={styles.formField}>
          <div className={styles.imageUploadContainer}>
            <label className={styles.imageUploadLabel}>
              Imagen del Producto
            </label>
            
            <div className={styles.imagePreviewBox}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Vista previa de imagen" 
                  className={styles.imagePreview} 
                />
              ) : (
                <div className={styles.noImagePlaceholder}>
                  <ImagePlus size={40} className={styles.placeholderIcon} />
                  <span>Sin imagen seleccionada</span>
                </div>
              )}
              
              {uploading && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{uploadProgress}%</span>
                </div>
              )}
            </div>
            
            <div className={styles.imageControlsContainer}>
              <input
                type="file"
                id="product_image"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
                disabled={uploading}
              />
              
              <label 
                htmlFor="product_image" 
                className={styles.imageButton}
                style={{ opacity: uploading ? 0.6 : 1 }}
              >
                <Camera size={16} />
                Seleccionar imagen
              </label>
              
              {selectedImage && (
                <button
                  type="button"
                  className={styles.clearImageButton}
                  onClick={handleClearImage}
                  disabled={uploading}
                >
                  <Trash2 size={16} />
                  Quitar imagen
                </button>
              )}
            </div>
            
            {/* <p className={styles.imageHelpText}>
              {selectedProductToUpdate 
                ? "La imagen se actualizará al guardar cambios" 
                : "La imagen se subirá al crear el producto"}
              <br/>
              Formatos aceptados: JPG, PNG, WebP. Tamaño máx: 5MB
            </p> */}
          </div>
        </div>

        {/* Country and locality fields */}
        <div className={styles.formField}>
          <select
            id="country_product"
            name="country_product"
            value={productData.country_product || ''}
            onChange={handleChange}
          >
            <option value="">Seleccionar país de origen</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <input
            type="text"
            id="locality_product"
            name="locality_product"
            placeholder='Localidad de origen:'
            value={productData.locality_product || ''}
            onChange={handleChange}
          />
        </div>

        {/* Product Type Dropdown - Filtered by shop type */}
        <div className={styles.formField}>
          <select
            id="type_product"
            name="type_product"
            value={productData.type_product}
            onChange={(e) => {
              // Reset subtype when type changes
              setNewProductData({
                ...productData,
                type_product: e.target.value,
                subtype_product: '' // Clear subtype
              });
            }}
            required
          >
            <option value="" disabled>Tipo:</option>
            {filteredProductTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Subtype Dropdown - Only show if a type is selected */}
        {productData.type_product && (
          <div className={styles.formField}>
            <select
              id="subtype_product"
              name="subtype_product"
              value={productData.subtype_product}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Subtipo:</option>
              {subtypes.map(subtype => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.formField}>
          <select
            id="season_product"
            name="season_product"
            value={productData.season_product}
            onChange={handleChange}
          >
            <option value="" disabled>Temporada:</option>
            {filterOptions.temporada.options.map(season => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formField}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="second_hand"
              name="second_hand"
              checked={productData.second_hand === 1}
              onChange={(e) => {
                handleChange({
                  target: {
                    name: 'second_hand',
                    value: e.target.checked ? 1 : 0
                  }
                });
              }}
            />
            <label htmlFor="second_hand">Producto de segunda mano</label>
          </div>
        </div>

        <div className={styles.formField}>
          <label htmlFor="discount_product">Descuento % (opcional)</label>
          <CustomNumberInput
            label="Descuento (%)"
            name="discount_product"
            value={productData.discount_product}
            onChange={handleNumericInputChange}
            step={1}
            min={0}
            max={100}
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="surplus_product">Excedente (opcional)</label>
          <CustomNumberInput
            label="Surplus"
            name="surplus_product"
            value={productData.surplus_product}
            onChange={handleNumericInputChange}
            min={0}
            required
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="expiration_product">Fecha de Caducidad (opcional)</label>
          <input
            type="date"
            id="expiration_product"
            name="expiration_product"
            value={productData.expiration_product || ''}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            className={styles.dateInput}
          />
        </div>

        <div className={styles.formField}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!selectedProductToUpdate && productCount >= productLimit}
          >
            {selectedProductToUpdate ? (
              <>
                Actualizar Producto
                <Save size={16}/>
              </>
            ) : (
              <>
                Crear Producto
                <PackagePlus size={16}/>
              </>
            )}
          </button>
          {!selectedProductToUpdate && productCount >= productLimit && (
            <p className={styles.errorMessage}>
              Has alcanzado el límite de productos permitidos
            </p>
          )}
        </div>
      </form>
    </animated.div>
  );
};

export default ProductCreationForm;