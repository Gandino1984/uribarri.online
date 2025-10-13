import React from 'react';
import { Camera, ImagePlus, Trash2, Loader } from 'lucide-react';
import styles from '../../../../../../../../public/css/ProductCreationForm.module.css';

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
  const handleImageContainerClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and preview
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

  //update: Add price unit options
  const priceUnitOptions = [
    'Euros/unidad',
    'Euros/hora',
    'Euros/sesión',
    'Euros/día',
    'Euros/semana',
    'Euros/mes',
    'Euros/año'
  ];

  return (
    <section className={styles.imageSection}>
      {/* <h2 className={styles.sectionTitle}>Imagen del producto</h2> */}
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
          
          {/* 🔄 UPDATE: Removed uploadButtonOverlay in favor of direct input triggering */}
          
          {/* File input (hidden) */}
          <input
            type="file"
            id="product_image"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
            disabled={uploading}
          />
          
          {/* Edit overlay hint */}
          {!uploading && (
            <div className={styles.editOverlay}>
              <Camera size={18} />
              <span>{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
            </div>
          )}
          
          {/* 🔄 UPDATE: Added overlay with remove button when image exists */}
          {imagePreview && !uploading && (
            <div className={styles.removeButtonOverlay}>
              <button
                type="button"
                onClick={handleClearImage}
                disabled={uploading}
                className={styles.removeButton}
              >
                <Trash2 size={16} />
                Quitar
              </button>
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
      
      {/* update: Product Price with Unit Select */}
      <div className={styles.formField}>
        <label className={styles.inputLabel} htmlFor="price_product">Precio</label>
        <div className={styles.priceContainer}>
          <input
            type="number"
            id="price_product"
            name="price_product"
            value={productData.price_product}
            onChange={onNumericInputChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00" /* 💰 UPDATE: Added placeholder for price format */
            className={styles.priceInput}
          />
          <select
            id="price_unit"
            name="price_unit"
            value={productData.price_unit || 'Euros/unidad'}
            onChange={handleChange}
            className={styles.priceUnitSelect}
            required
          >
            {priceUnitOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default ProductImageUpload;