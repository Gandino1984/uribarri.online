import React, { useState, useRef } from 'react';
import { Camera, ImagePlus, Trash2, Loader } from 'lucide-react';
import styles from '../../../../../../../../../public/css/ProductCreationForm.module.css';

const ProductImageUpload = ({ 
  imagePreview, 
  setImagePreview, 
  selectedImage, 
  setSelectedImage, 
  productData, 
  onProductDataChange, 
  onNumericInputChange,
  uploading, 
  uploadProgress, 
  fileInputRef,
  setError,
  setShowErrorCard
}) => {
  const [showImageUploadButton, setShowImageUploadButton] = useState(false);

  // Handle container click to toggle upload button visibility
  const handleImageContainerClick = () => {
    setShowImageUploadButton(prev => !prev);
  };

  // Handle file selection and preview
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

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 10MB."
      }));
      setShowErrorCard(true);
      return;
    }
    
    // Inform user if image will be optimized
    if (file.size > 1024 * 1024 || file.type !== 'image/webp') {
      console.log(`Image will be optimized: ${Math.round(file.size/1024)}KB, type: ${file.type}`);
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

  // Function to clear the selected image
  const handleClearImage = (e) => {
    if (e) e.stopPropagation(); // Prevent container click event
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle change for name field
  const handleChange = (e) => {
    const { name, value } = e.target;
    onProductDataChange({
      target: { name, value }
    });
  };

  return (
    <section className={styles.imageSection}>
      <h2 className={styles.sectionTitle}>Imagen del producto</h2>
      <p className={styles.sectionDescription}>
        Sube una imagen para tu producto
      </p>
      
      {/* Image Upload Container */}
      <div 
        className={styles.imageUploadContainer}
        onClick={handleImageContainerClick}
      >
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
              <span>Imagen de producto</span>
            </div>
          )}
          
          {/* Upload progress indicator */}
          {uploading && (
            <div className={styles.loaderOverlay}>
              <Loader size={32} color="white" className={styles.spinner} />
              
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
          
          {/* Image upload button overlay */}
          {showImageUploadButton && !uploading && (
            <div 
              className={styles.uploadButtonOverlay}
              onClick={(e) => e.stopPropagation()}
            >
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
              >
                <Camera size={16} />
                {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </label>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  disabled={uploading}
                  className={styles.clearImageButton}
                >
                  <Trash2 size={16} />
                  Quitar
                </button>
              )}
            </div>
          )}
          
          {/* Edit overlay hint */}
          {!showImageUploadButton && !uploading && (
            <div className={styles.editOverlay}>
              <Camera size={18} />
              <span>{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Name */}
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
      
      {/* Product Price */}
      <div className={styles.formField}>
        <label htmlFor="price_product">Precio</label>
        <input
          type="number"
          id="price_product"
          name="price_product"
          value={productData.price_product}
          onChange={onNumericInputChange}
          step="0.01"
          min="0"
          required
        />
      </div>
    </section>
  );
};

export default ProductImageUpload;