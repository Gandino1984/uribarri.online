import React, { useContext } from 'react';
import { Camera, Loader } from 'lucide-react';
import AppContext from '../../../../app_context/AppContext';
import styles from '../../../../../../public/css/ProductImage.module.css';
import { ProductImageFunctions } from './ProductImageFunctions.jsx';

const ProductImage = ({ id_product }) => {
  const {
    uploading,
    selectedProductForImageUpload,
    selectedProducts,
    products,
    setError
  } = useContext(AppContext);

  const {
    handleProductImageUpload,
    getProductImageUrl,
  } = ProductImageFunctions();

  // Find the product based on id_product
  const product = products.find(p => p.id_product === id_product);

  const handleImageUpload = async (event) => {
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
      <img
        src={getProductImageUrl(product?.image_product)}
        alt={`Product image`}
        className={styles.productImage}
      />

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

      {uploading && <Loader size={16} />}
    </div>
  );
};

export default ProductImage;

