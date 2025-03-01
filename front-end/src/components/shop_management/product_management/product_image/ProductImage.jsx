import React, { useContext } from 'react';
import { Camera, Loader } from 'lucide-react';
import AppContext from '../../../../app_context/AppContext';
import styles from '../../../../../../public/css/ProductImage.module.css';
import { ProductImageFunctions } from './ProductImageFunctions.jsx';

const ProductImage = ({ id_product }) => {
  const {
    selectedProductForImageUpload,
    selectedProducts,
    products,
    setError
  } = useContext(AppContext);

  const {
    handleProductImageUpload,
    getProductImageUrl,
    uploading
  } = ProductImageFunctions();

  // Find the product based on id_product
  const product = products.find(p => p.id_product === id_product);

  const handleImageUpload = async (event) => {
    event.stopPropagation(); // Prevent event bubbling
    
    const file = event.target.files[0];
    if (!file) {
      setError(prevError => ({ ...prevError, imageError: "No se ha seleccionado un archivo de imagen" }));
      return;
    }

    try {
      await handleProductImageUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  // Check if the current product is selected
  const isProductSelected = selectedProducts.has(id_product);

  return (
    <div className={styles.productImageContainer}>
      {product?.image_product ? (
        <img
          src={getProductImageUrl(product.image_product)}
          alt={`Product image for ${product.name_product || 'product'}`}
          className={styles.productImage}
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            console.error('Original image path:', product.image_product);
            e.target.style.display = 'none';
            // Add fallback content
            const fallback = document.createElement('span');
            fallback.textContent = 'Image failed to load';
            e.target.parentNode.appendChild(fallback);
          }}
        />
      ) : (
        <div className={styles.noImage}>
          <span>No image</span>
        </div>
      )}

      {/* Conditional rendering of the file input and label */}
      {isProductSelected && selectedProductForImageUpload === id_product && (
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
            style={{ cursor: uploading ? 'wait' : 'pointer' }}
          >
            <Camera size={16} />
          </label>
        </>
      )}

      {uploading && selectedProductForImageUpload === id_product && (
        <div className={styles.loader}>
          <Loader size={16} className={styles.loaderIcon} />
        </div>
      )}
    </div>
  );
};

export default ProductImage;