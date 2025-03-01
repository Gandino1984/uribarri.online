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

  const handleProductImageUpload = async (file) => {
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

      // Use the unified upload service instead of direct axios call
      const imagePath = await uploadProductImage({
        file,
        shopId: selectedShop.id_shop,
        shopName: selectedShop.name_shop,
        productId: selectedProductForImageUpload,
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
        },
        onError: (errorMessage) => {
          console.error('Upload error:', errorMessage);
          setError(prevError => ({
            ...prevError,
            imageError: errorMessage
          }));
        }
      });

      // Update the products list with the new image
      const updatedProducts = products.map(product =>
        product.id_product === selectedProductForImageUpload
          ? { ...product, image_product: imagePath }
          : product
      );
      setProducts(updatedProducts);

      return imagePath;
    } catch (err) {
      console.error('Error uploading product image:', err);
      setError(prevError => ({
        ...prevError,
        imageError: err.response?.data?.error || err.message || "Error uploading file",
      }));
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getProductImageUrl = (imagePath) => {
    return formatImageUrl(imagePath);
  };

  return {
    handleProductImageUpload,
    getProductImageUrl,
  };
};