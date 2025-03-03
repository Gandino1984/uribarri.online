import React, { useContext, memo, useState, useEffect } from 'react';
import { Camera, Loader } from 'lucide-react';
import AppContext from '../../../../app_context/AppContext';
import { ShopCoverImageFunctions } from './ShopCoverImageFunctions';
import styles from '../../../../../../public/css/ShopCoverImage.module.css';

const ShopCoverImage = ({ id_shop }) => {
  const { selectedShop, shops } = useContext(AppContext);
  const [imageKey, setImageKey] = useState(Date.now()); // Force re-render when needed
  
  const {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    showUploadButton,
    uploading,
    uploadProgress,
    localImageUrl,
    lastUpdated
  } = ShopCoverImageFunctions();

  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  // Update image key when any of these dependencies change to force re-render
  useEffect(() => {
    setImageKey(Date.now());
    console.log(`Shop image key updated to: ${Date.now()}`);
  }, [shop?.image_shop, localImageUrl, lastUpdated, selectedShop?.image_shop]);
  
  // Debug logging for image path changes
  useEffect(() => {
    if (shop?.image_shop) {
      console.log(`Shop ${id_shop} image path updated:`, shop.image_shop);
      console.log('Formatted URL:', getShopCoverUrl(shop.image_shop));
    }
  }, [shop?.image_shop, getShopCoverUrl, id_shop]);
  
  // Debug selected shop state
  useEffect(() => {
    if (isSelected && selectedShop) {
      console.log('Selected shop state:', selectedShop);
    }
  }, [isSelected, selectedShop]);

  // Get the appropriate image URL with fallbacks
  const getImageSource = () => {
    // First check if there's a local image URL from a recent upload
    if (localImageUrl) {
      return localImageUrl;
    }
    
    // Then try to get the formatted URL from the server path
    if (shop?.image_shop) {
      return getShopCoverUrl(shop.image_shop);
    }
    
    // If the selected shop has a different image path, use that as a fallback
    if (isSelected && selectedShop?.image_shop) {
      return getShopCoverUrl(selectedShop.image_shop);
    }
    
    return null;
  };

  const imageSource = getImageSource();
  
  // Debug the image source determination
  useEffect(() => {
    if (isSelected) {
      console.log('Image source determination for selected shop:', {
        localImageUrl,
        'shop?.image_shop': shop?.image_shop,
        'selectedShop?.image_shop': selectedShop?.image_shop,
        finalImageSource: imageSource
      });
    }
  }, [isSelected, localImageUrl, shop?.image_shop, selectedShop?.image_shop, imageSource]);

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.imageWrapper} ${isSelected ? styles.selectedShop : ''}`}
        onClick={() => handleContainerClick(id_shop)}
      >
        {imageSource ? (
          <img
            key={`shop-cover-${id_shop}-${imageKey}`} // Force image reload when key changes
            src={imageSource}
            alt={`${shop?.name_shop || 'Shop'} cover`}
            className={styles.image}
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              console.error('Original image path:', shop?.image_shop);
              e.target.style.display = 'none';
              // Show fallback content when image fails to load
              e.target.parentNode.classList.add(styles.noImage);
              const fallback = document.createElement('span');
              fallback.className = styles.noImageText;
              fallback.textContent = 'Image failed to load';
              e.target.parentNode.appendChild(fallback);
            }}
          />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageText}>
              {isSelected ? 'Imagen de portada de comercio' : 'No hay imagen'}
            </span>
          </div>
        )}

        {showUploadButton && isSelected && (
          <div 
            className={styles.uploadButtonContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => handleImageUpload(e, id_shop)}
              className={styles.fileInput}
              id={`shop-cover-input-${id_shop}`}
              disabled={uploading}
            />
            <label
              htmlFor={`shop-cover-input-${id_shop}`}
              className={styles.uploadButton}
              style={{ cursor: uploading ? 'wait' : 'pointer' }}
              onClick={handleUploadButtonClick}
            >
              <Camera size={16} className={styles.cameraIcon} />
              <span className={styles.uploadText}>Subir imagen</span>
            </label>
          </div>
        )}

        {uploading && (
          <div className={styles.loader}>
            <Loader size={24} className={styles.loaderIcon} />
            {uploadProgress > 0 && (
              <div className={styles.progressContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className={styles.progressText}>{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
        
        {isSelected && !showUploadButton && !uploading && (
          <div className={styles.editOverlay}>
            <Camera size={20} className={styles.editIcon} />
            <span className={styles.editText}>{shop?.image_shop ? 'Cambiar imagen' : 'Subir imagen'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Use React.memo with a custom comparison function that always re-renders
// when the shop ID changes or when forced by parent
export default memo(ShopCoverImage, (prevProps, nextProps) => {
  // Always re-render when the shop ID changes
  return prevProps.id_shop === nextProps.id_shop;
});