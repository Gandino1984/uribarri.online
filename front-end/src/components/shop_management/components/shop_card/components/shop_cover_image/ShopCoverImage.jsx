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

  //update: Find the shop from shops array using id_shop
  const shop = shops.find(s => s.id_shop === id_shop);
  const isSelected = selectedShop?.id_shop === id_shop;
  
  //update: Detailed logging to debug the issue
  useEffect(() => {
    console.group(`🔍 ShopCoverImage Debug - Shop ID: ${id_shop}`);
    console.log('Shop from array:', shop);
    console.log('Shop image_shop:', shop?.image_shop);
    console.log('Selected shop:', selectedShop);
    console.log('Selected shop image_shop:', selectedShop?.image_shop);
    console.log('Is selected:', isSelected);
    console.log('Local image URL:', localImageUrl);
    console.log('Last updated:', lastUpdated);
    console.log('Shops array:', shops);
    console.groupEnd();
    
    const newKey = Date.now();
    setImageKey(newKey);
  }, [shop?.image_shop, selectedShop?.image_shop, localImageUrl, lastUpdated, id_shop, shops, shop, selectedShop, isSelected]);
  
  const handleDirectClick = (e) => {
    if (isSelected && !uploading && fileInputRef.current) {
      e.stopPropagation();
      console.log('📸 File input clicked for shop:', id_shop);
      fileInputRef.current.click();
    }
  };

  //update: Improved image source selection with extensive logging
  const getImageSource = () => {
    console.group(`🖼️ Getting Image Source for Shop ${id_shop}`);
    
    // Priority 1: Local preview during upload
    if (localImageUrl) {
      console.log('✓ Using local preview URL');
      console.groupEnd();
      return localImageUrl;
    }
    
    // Priority 2: Selected shop data (most current)
    if (isSelected && selectedShop?.image_shop) {
      const url = getShopCoverUrl(selectedShop.image_shop);
      console.log('✓ Using selectedShop image_shop:', selectedShop.image_shop);
      console.log('✓ Formatted URL:', url);
      console.groupEnd();
      return url;
    }
    
    // Priority 3: Shop from shops array
    if (shop?.image_shop) {
      const url = getShopCoverUrl(shop.image_shop);
      console.log('✓ Using shop array image_shop:', shop.image_shop);
      console.log('✓ Formatted URL:', url);
      console.groupEnd();
      return url;
    }
    
    console.log('✗ No image available');
    console.log('Checked paths:');
    console.log('  - localImageUrl:', localImageUrl);
    console.log('  - selectedShop?.image_shop:', selectedShop?.image_shop);
    console.log('  - shop?.image_shop:', shop?.image_shop);
    console.groupEnd();
    return null;
  };

  const imageSource = getImageSource();

  //update: Log final render state
  console.log(`🎨 Rendering ShopCoverImage for shop ${id_shop}:`, {
    hasImageSource: !!imageSource,
    imageSource,
    isSelected,
    uploading
  });

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.imageWrapper} ${isSelected ? styles.selectedShop : ''}`}
        onClick={handleDirectClick}
      >
        {imageSource ? (
          <>
            <img
              key={`shop-cover-${id_shop}-${imageKey}`}
              src={imageSource}
              alt={`${shop?.name_shop || 'Shop'} cover`}
              className={styles.image}
              onError={(e) => {
                console.group(`❌ Image Load Error - Shop ${id_shop}`);
                console.error('Failed to load image');
                console.error('Image URL:', imageSource);
                console.error('Shop data:', shop);
                console.error('Selected shop data:', selectedShop);
                console.error('Image element:', e.target);
                console.error('Error event:', e);
                console.groupEnd();
                
                //update: Try to display the broken image info
                e.target.style.display = 'none';
              }}
              onLoad={() => {
                console.log(`✅ Image loaded successfully for shop ${id_shop}:`, imageSource);
              }}
            />
          </>
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
          onChange={(e) => {
            console.log('📁 File input changed for shop:', id_shop);
            handleImageUpload(e, id_shop);
          }}
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
            <span className={styles.editText}>
              {(shop?.image_shop || selectedShop?.image_shop) ? 'Cambiar imagen' : 'Subir imagen'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

//update: Remove memo to ensure component always re-renders with fresh data
export default ShopCoverImage;