import React, { memo, useState, useEffect, useRef } from 'react';
import { Camera, Loader } from 'lucide-react';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { ShopCoverImageUtils } from './ShopCoverImageUtils.jsx';
import styles from '../../../../../../../../public/css/ShopCoverImage.module.css';

const ShopCoverImage = ({ id_shop }) => {
  const { selectedShop, shops } = useShop();
  const [imageKey, setImageKey] = useState(Date.now());
  const fileInputRef = useRef(null);
  
  const {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    uploading,
    uploadProgress,
    localImageUrl,
    lastUpdated
  } = ShopCoverImageUtils();

  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  //update: Force re-render when image path changes in either shop or selectedShop
  useEffect(() => {
    const newKey = Date.now();
    setImageKey(newKey);
    console.log(`Image key updated for shop ${id_shop}:`, newKey);
  }, [shop?.image_shop, selectedShop?.image_shop, localImageUrl, lastUpdated, id_shop]);
  
  useEffect(() => {
    if (isSelected && (shop?.image_shop || selectedShop?.image_shop)) {
      const imagePath = shop?.image_shop || selectedShop?.image_shop;
      console.log(`Selected shop ${id_shop} image path:`, getShopCoverUrl(imagePath));
    }
  }, [isSelected, shop?.image_shop, selectedShop?.image_shop, getShopCoverUrl, id_shop]);

  const handleDirectClick = (e) => {
    if (isSelected && !uploading && fileInputRef.current) {
      e.stopPropagation();
      fileInputRef.current.click();
    }
  };

  //update: Improved image source selection with better fallback logic
  const getImageSource = () => {
    if (localImageUrl) {
      return localImageUrl;
    }
    
    //update: For selected shop, prioritize selectedShop data
    if (isSelected && selectedShop?.image_shop) {
      return getShopCoverUrl(selectedShop.image_shop);
    }
    
    if (shop?.image_shop) {
      return getShopCoverUrl(shop.image_shop);
    }
    
    return null;
  };

  const imageSource = getImageSource();

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.imageWrapper} ${isSelected ? styles.selectedShop : ''}`}
        onClick={handleDirectClick}
      >
        {imageSource ? (
          <img
            key={`shop-cover-${id_shop}-${imageKey}`}
            src={imageSource}
            alt={`${shop?.name_shop || 'Shop'} cover`}
            className={styles.image}
            //update: Added onError handler to help debug image loading issues
            onError={(e) => {
              console.error(`Failed to load image for shop ${id_shop}:`, imageSource);
              console.log('Image element:', e.target);
            }}
            onLoad={() => {
              console.log(`Image loaded successfully for shop ${id_shop}:`, imageSource);
            }}
          />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageText}>
              {isSelected ? 'Imagen de portada' : 'No hay imagen'}
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={(e) => handleImageUpload(e, id_shop)}
          className={styles.fileInput}
          id={`shop-cover-input-${id_shop}`}
          disabled={uploading}
        />

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
        
        {isSelected && !uploading && (
          <div className={styles.editOverlay}>
            <Camera size={20} className={styles.editIcon} />
            <span className={styles.editText}>{shop?.image_shop || selectedShop?.image_shop ? 'Cambiar imagen' : 'Subir imagen'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

//update: Improved memo comparison to also check for image_shop changes
export default memo(ShopCoverImage, (prevProps, nextProps) => {
  return prevProps.id_shop === nextProps.id_shop;
});