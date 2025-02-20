import React from 'react';
import { Camera, Loader } from 'lucide-react';
import { useContext } from 'react';
import AppContext from '../../../../app_context/AppContext';
import { ShopCoverImageFunctions } from './ShopCoverImageFunctions';
import styles from '../../../../../../public/css/ShopCoverImage.module.css';

const ShopCoverImage = ({ id_shop }) => {
  const { selectedShop, shops } = useContext(AppContext);
  
  const {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    showUploadButton,
    uploading
  } = ShopCoverImageFunctions();

  const shop = shops.find(s => s.id_shop === id_shop);
  
  console.log('ShopCoverImage rendered for ', shop?.name_shop || 'Shop');

  return (
    <div className={styles.container}>
      <div 
        className={styles.imageWrapper}
        onClick={() => {
          console.log('Image wrapper clicked');
          handleContainerClick(id_shop);
        }}
      >
        {shop?.image_shop ? (
          <img
            src={getShopCoverUrl(shop.image_shop)}
            alt={`${shop?.name_shop || 'Shop'} cover`}
            className={styles.image}
            onError={(e) => {
              console.error('Image failed to load:', e);
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageText}>No cover image available</span>
          </div>
        )}

        {showUploadButton && selectedShop?.id_shop === id_shop && (
          <div 
            className={styles.uploadButtonContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => {
                console.log('File input change event:', e);
                handleImageUpload(e, id_shop);
              }}
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
            </label>
          </div>
        )}

        {uploading && (
          <div className={styles.loader}>
            <Loader size={16} className={styles.loaderIcon} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCoverImage;