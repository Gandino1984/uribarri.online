import axiosInstance from '../../../../utils/app/axiosConfig.js';
import { validateImageFile } from '../../../../utils/image/imageValidation.js';
import { useContext } from 'react';
import AppContext from '../../../../app_context/AppContext.js';

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

    if (!selectedShop?.name_shop) {
      throw new Error("No shop selected");
    }

    try {
      await validateImageFile(file);

      const formData = new FormData();
      formData.append('productImage', file);

      setUploading(true);

      const response = await axiosInstance.post(
        '/product/upload-product-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Shop-Name': selectedShop.name_shop,
            'X-Product-ID': selectedProductForImageUpload,
          },
        }
      );

      if (response.data.data?.image_product) {
        // Update the products list with the new image
        const updatedProducts = products.map(product =>
          product.id_product === selectedProductForImageUpload
            ? { ...product, image_product: response.data.data.image_product }
            : product
        );
        setProducts(updatedProducts);

        return response.data.data.image_product;
      }
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
    if (!imagePath) {
      console.warn('No image path provided');
      return null;
    }

    const cleanPath = imagePath.replace(/^\/+/, ''); // Remove leading slashes
    const baseUrl = axiosInstance.defaults.baseURL || ''; // Get the base URL from axios config
    const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1"); // Construct the full URL

    console.log('Generated Image URL:', imageUrl); // Log the generated URL for debugging
    return imageUrl;
  };

  return {
    handleProductImageUpload,
    getProductImageUrl,
  };
};