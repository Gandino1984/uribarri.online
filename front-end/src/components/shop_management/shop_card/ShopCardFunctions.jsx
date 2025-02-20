import { useContext } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import { validateImageFile } from '../../../../utils/imageValidation.js';
import axiosInstance from '../../../../utils/axiosConfig.js';

const ShopCardFunctions = () => {
  const {
    setError,
    setUploading,
    selectedShop,
    setShops,
    shops,
  } = useContext(AppContext);

  const handleShopImageUpload = async (file) => {
    if (!file) {
      throw new Error("No file provided");
    }

    if (!selectedShop?.id_shop) {
      throw new Error("No shop selected");
    }

    try {
      await validateImageFile(file);

      const formData = new FormData();
      formData.append('shopImage', file);

      setUploading(true);

      const response = await axiosInstance.post(
        '/shop/upload-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Shop-ID': selectedShop.id_shop,
          },
        }
      );

      if (response.data.data?.image_shop) {
        // Update the shops list with the new image
        const updatedShops = shops.map(shop =>
          shop.id_shop === selectedShop.id_shop
            ? { ...shop, image_shop: response.data.data.image_shop }
            : shop
        );
        setShops(updatedShops);

        return response.data.data.image_shop;
      }
    } catch (err) {
      console.error('Error uploading shop image:', err);
      setError(prevError => ({
        ...prevError,
        imageError: err.response?.data?.error || err.message || "Error uploading file",
      }));
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getShopImageUrl = (imagePath) => {
    if (!imagePath) {
      console.warn('No image path provided');
      return null;
    }

    const cleanPath = imagePath.replace(/^\/+/, '');
    const baseUrl = axiosInstance.defaults.baseURL || '';
    const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");

    return imageUrl;
  };

  return {
    getShopImageUrl,
    handleShopImageUpload
   
  };
};

export default ShopCardFunctions;