import React, { useContext, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import styles from '../../../../../public/css/ShopCreationForm.module.css';
import { ImagePlus, Camera, Trash2, Loader } from 'lucide-react';

const ShopImageSection = forwardRef(({ handleImageUpload }, ref) => {
  const { 
    newShop, 
    setNewShop,
    selectedShop,
    setError,
    setShowErrorCard,
    currentUser,
    uploading,
    setUploading
  } = useContext(AppContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageUploadButton, setShowImageUploadButton] = useState(false);
  const fileInputRef = useRef(null);

  // Update image preview when selected shop changes
  useEffect(() => {
    if (selectedShop && selectedShop.image_shop) {
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
  }, [selectedShop]);

  // Handle automatic image upload when shop is created/updated successfully
  useEffect(() => {
    // This would be triggered by a successful form submission
    // The parent component would set a shopId prop which would trigger this upload
    const uploadImageIfSelected = async (shopId) => {
      if (selectedImage && shopId) {
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
    };

    // This would be called with a shopId when we want to trigger the upload
    // For now, we're just setting up the function
  }, [handleImageUpload, selectedImage, setError, setShowErrorCard, setUploading]);

  const handleImageContainerClick = () => {
    setShowImageUploadButton(prev => !prev);
  };

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

  const handleClearImage = (e) => {
    e.stopPropagation(); // Prevent container click event
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Method to trigger upload - exposed to parent component via ref
  const uploadImage = async (shopId) => {
    if (selectedImage && shopId) {
      try {
        setUploading(true);
        const success = await handleImageUpload(
          selectedImage, 
          shopId, 
          (progress) => setUploadProgress(progress)
        );
        
        if (success) {
          // Clear selection after successful upload
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        
        return success;
      } catch (error) {
        console.error('Error uploading image:', error);
        return false;
      } finally {
        setUploading(false);
      }
    }
    return false;
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    uploadImage,
    hasImage: () => !!selectedImage
  }));

  return (
    <section className={styles.imageSection}> 
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
            <div className={styles.imagePlaceholder}>
              <ImagePlus size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
            </div>
          )}
          
          {/* Upload progress indicator */}
          {uploading && (
            <div className={styles.loaderOverlay}>
              <Loader size={32} color="white" className={styles.spinningLoader}/>
              
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>
                {uploadProgress}%
              </span>
            </div>
          )}
          
          {/* Image upload button */}
          {showImageUploadButton && !uploading && (
            <div 
              className={styles.uploadButtonOverlay}
              onClick={(e) => e.stopPropagation()}
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
              
              <div className={styles.imageButtonsContainer}>
                <label 
                  htmlFor="shop_image" 
                  className={styles.imageButton}
                >
                  <Camera size={16} />
                  {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </label>
                
                {imagePreview && (
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleClearImage}
                    disabled={uploading}
                  >
                    <Trash2 size={16} />
                    Quitar
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Edit overlay hint */}
          {!showImageUploadButton && !uploading && (
            <div className={styles.editOverlay}>
              <Camera size={18} />
              <span>{imagePreview ? 'Cambiar portada' : 'Subir portada'}</span>
            </div>
          )}
        </div>  
      </div>
    </section>
  );
});

export default ShopImageSection;