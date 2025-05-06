import React, { useState } from 'react';
import { Camera, ImagePlus, Trash2, Loader } from 'lucide-react';
import styles from '../../../../../../../public/css/ShopCreationForm.module.css';

const ShopImageUpload = ({ 
  imagePreview, 
  setImagePreview, 
  selectedImage, 
  setSelectedImage, 
  uploading, 
  uploadProgress, 
  setUploadProgress,
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

  // Function to clear the selected image
  const handleClearImage = (e) => {
    e.stopPropagation(); // Prevent container click event
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className={styles.imageSection}>  
      <h2 className={styles.sectionTitle}>Sube una imagen:</h2>
      <p className={styles.sectionDescription}>
        Esta será la portada de la tarjeta de tu comercio
      </p>
      
      <div 
        className={styles.imageUploadContainer}
        onClick={handleImageContainerClick}
      >
        <div className={styles.imagePreviewBox}>
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Vista previa de imagen" 
            />
          ) : (
            <div className={styles.imagePlaceholder} >
              <ImagePlus size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
            </div>
          )}
          
          {/* Upload progress indicator */}
          {uploading && (
            <div className={styles.loaderOverlay}>
              <Loader size={32} color="white" className={styles.spinningLoader}/>
              
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
            id="shop_image"
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
    </section>
  );
};

export default ShopImageUpload;