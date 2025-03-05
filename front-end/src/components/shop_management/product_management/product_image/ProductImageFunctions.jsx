import { useContext } from 'react';
import AppContext from '../../../../app_context/AppContext.js';
import { uploadProductImage, formatImageUrl } from '../../../../utils/image/imageUploadService.js';

export const ProductImageFunctions = () => {
  const {
    setError,
    setUploading,
    selectedShop,
    selectedProductForImageUpload,
    products,
    setProducts,
  } = useContext(AppContext);

  const handleProductImageUpload = async (file, onProgressCallback = null) => {
    if (!file) {
      throw new Error("No file provided");
    }

    if (!selectedProductForImageUpload) {
      throw new Error("No product selected for image upload");
    }

    if (!selectedShop?.id_shop) {
      throw new Error("No shop selected");
    }

    try {
      setUploading(true);
      console.log('Starting image upload for product:', selectedProductForImageUpload);
      console.log('Shop info:', {
        id: selectedShop.id_shop,
        name: selectedShop.name_shop
      });

      // Use the unified upload service
      const imagePath = await uploadProductImage({
        file,
        shopId: selectedShop.id_shop,
        shopName: selectedShop.name_shop,
        productId: selectedProductForImageUpload,
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
          if (onProgressCallback) onProgressCallback(progress);
        },
        onError: (errorMessage) => {
          console.error('Upload error:', errorMessage);
          setError(prevError => ({
            ...prevError,
            imageError: errorMessage
          }));
        }
      });

      console.log('Image upload successful, path:', imagePath);

      // Create a completely new array to ensure React detects the state change
      const updatedProducts = products.map(product => {
        if (product.id_product === selectedProductForImageUpload) {
          // Create a new product object with the updated image_product
          return { ...product, image_product: imagePath };
        }
        return product;
      });
      
      // Force a state update with the new array
      setProducts(updatedProducts);
      
      // Log the updated products to verify
      console.log('Products state updated with new image path');
      
      return imagePath;
    } catch (err) {
      console.error('Error uploading product image:', err);
      const errorMessage = err.response?.data?.error || err.message || "Error uploading file";
      setError(prevError => ({
        ...prevError,
        imageError: errorMessage,
      }));
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // UPDATE: Improved getProductImageUrl function with better error handling
  const getProductImageUrl = (imagePath) => {
    // Handle null/undefined paths gracefully
    if (!imagePath) {
      console.log('No image path provided to format');
      return null;
    }
    
    // Handle empty strings
    if (typeof imagePath === 'string' && imagePath.trim() === '') {
      console.log('Empty image path provided to format');
      return null;
    }
    
    try {
      // Format the image URL
      const formattedUrl = formatImageUrl(imagePath);
      return formattedUrl;
    } catch (error) {
      // Log but don't crash
      console.error('Error formatting image URL:', error);
      console.error('Problem image path:', imagePath);
      return null;
    }
  };

  return {
    handleProductImageUpload,
    getProductImageUrl,
  };
};