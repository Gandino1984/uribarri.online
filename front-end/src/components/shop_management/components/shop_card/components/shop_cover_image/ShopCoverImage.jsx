import React, { useContext, memo, useState, useEffect } from 'react';
import { Camera, Loader } from 'lucide-react';
import AppContext from '../../../../../../app_context/AppContext.js';
import { ShopCoverImageUtils } from './ShopCoverImageUtils';
import styles from '../../../../../../../../public/css/ShopCoverImage.module.css';

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
  } = ShopCoverImageUtils();

  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  // UPDATE: Solo actualizar la clave de imagen cuando realmente sea necesario
  useEffect(() => {
    const newKey = Date.now();
    setImageKey(newKey);
  }, [shop?.image_shop, localImageUrl, lastUpdated]);
  
  // UPDATE: Reducir registro de logs innecesarios
  useEffect(() => {
    if (isSelected && shop?.image_shop) {
      console.log(`Selected shop ${id_shop} image path:`, getShopCoverUrl(shop.image_shop));
    }
  }, [isSelected, shop?.image_shop, getShopCoverUrl, id_shop]);

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

  return (
    // UPDATE: Added aspect-ratio container to maintain consistent 800x300 (2.67:1) ratio
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
          />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageText}>
              {isSelected ? 'Imagen de portada' : 'No hay imagen'}
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

// UPDATE: Mejorar la función de comparación de memoización para evitar rerenderizados innecesarios
export default memo(ShopCoverImage, (prevProps, nextProps) => {
  // Solo re-renderizar cuando cambia el ID de la tienda
  return prevProps.id_shop === nextProps.id_shop;
});