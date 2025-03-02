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
    localImageUrl
  } = ShopCoverImageFunctions();

  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  // When the image path changes or local image is available, force a re-render
  useEffect(() => {
    if (shop?.image_shop || localImageUrl) {
      setImageKey(Date.now());
    }
  }, [shop?.image_shop, localImageUrl]);
  
  // Debug image path
  useEffect(() => {
    if (shop?.image_shop) {
      console.log('Current shop image path:', shop.image_shop);
      console.log('Formatted URL:', getShopCoverUrl(shop.image_shop));
    }
  }, [shop?.image_shop, getShopCoverUrl]);

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.imageWrapper} ${isSelected ? styles.selectedShop : ''}`}
        onClick={() => handleContainerClick(id_shop)}
      >
        {(shop?.image_shop || localImageUrl) ? (
          <img
            key={imageKey} // Force image reload when key changes
            src={getShopCoverUrl(shop?.image_shop)}
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
              {isSelected ? 'Click to add cover image' : 'No cover image available'}
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

// Use React.memo to prevent unnecessary re-renders but with custom comparison
export default memo(ShopCoverImage, (prevProps, nextProps) => {
  // Always re-render when the shop ID changes
  if (prevProps.id_shop !== nextProps.id_shop) {
    return false;
  }
  // Otherwise, rely on default shallow comparison
  return true;
});