import React, { useState, useEffect } from 'react';
import { Camera, Loader } from 'lucide-react';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useProduct } from '../../../../../../app_context/ProductContext.jsx';
import styles from '../../../../../../../../public/css/ProductImage.module.css';
import { ProductImageUtils } from './ProductImageUtils.jsx';

// UPDATE: Refactored to use specialized context hooks instead of AppContext
const ProductImage = ({ id_product }) => {
  // UI context
  const { setError, uploading, setUploading } = useUI();
  
  // Product context
  const { selectedProductForImageUpload, selectedProducts, products } = useProduct();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const {
    handleProductImageUpload,
    getProductImageUrl
  } = ProductImageUtils();

  // Find the product based on id_product
  // Add a null check to prevent errors when product is not found
  const product = products?.find(p => p.id_product === id_product) || null;

  // Update imageUrl when product changes or after upload
  useEffect(() => {
    // Only try to get image URL if product exists and has an image
    if (product && product.image_product) {
      const url = getProductImageUrl(product.image_product);
      setImageUrl(url);
      
      // Add timestamp parameter to force image refresh
      if (url) {
        const refreshUrl = url.includes('?') 
          ? `${url}&t=${Date.now()}` 
          : `${url}?t=${Date.now()}`;
        setImageUrl(refreshUrl);
      }
    } else {
      setImageUrl(null);
    }
  }, [product, lastUpdated, getProductImageUrl]);

  const handleImageUpload = async (event) => {
    event.stopPropagation(); // Prevent event bubbling
    
    const file = event.target.files[0];
    if (!file) {
      setError(prevError => ({ ...prevError, imageError: "No se ha seleccionado un archivo de imagen" }));
      return;
    }

    try {
      setUploading(true);
      await handleProductImageUpload(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Force a refresh of the image after upload
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(prevError => ({ 
        ...prevError, 
        imageError: error.message || "Error al subir la imagen"
      }));
    } finally {
      setUploading(false);
    }
  };

  // Check if the current product is selected
  const isProductSelected = selectedProducts.has(id_product);
  const isCurrentProductForUpload = selectedProductForImageUpload === id_product;
  const shouldShowUploadButton = isProductSelected && isCurrentProductForUpload;

  return (
    <div 
      className={styles.productImageContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          // Safe access to product name with fallback
          alt={`Product image for ${product?.name_product || 'product'}`}
          className={styles.productImage}
          key={`product-image-${id_product}-${lastUpdated}`} // Force re-render when updated
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            console.error('Original image path:', product?.image_product);
            e.target.style.display = 'none';
            
            // Add fallback content
            const fallback = document.createElement('span');
            fallback.textContent = 'Sin imagen';
            e.target.parentNode.appendChild(fallback);
          }}
        />
      ) : (
        <div className={styles.noImage}>
          <span>Sin imagen</span>
        </div>
      )}

      {/* Always show the upload button when selected for better UX */}
      {isProductSelected && (isHovered || isCurrentProductForUpload) && (
        <>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id={`product-image-input-${id_product}`}
            disabled={uploading}
          />
          <label
            htmlFor={`product-image-input-${id_product}`}
            className={styles.uploadButton}
            style={{ 
              cursor: uploading ? 'wait' : 'pointer',
              opacity: isHovered || isCurrentProductForUpload ? 1 : 0.6
            }}
          >
            <Camera size={16} />
          </label>
        </>
      )}

      {uploading && isCurrentProductForUpload && (
        <div className={styles.loader}>
          <Loader size={16} className={styles.loaderIcon} />
          {uploadProgress > 0 && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImage;