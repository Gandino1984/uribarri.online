import { useContext, useCallback, useRef } from 'react';
import AppContext from '../../../app_context/AppContext.js';
import { validateImageFile } from '../../../../../front-end/src/utils/image/imageUploadService.js';
import axiosInstance from '../../../utils/app/axiosConfig.js';

const ShopCardFunctions = () => {
  const {
    setError,
    setUploading,
    selectedShop,
    setShops,
    shops,
  } = useContext(AppContext);
  
  // UPDATE: Añadir un ref para evitar múltiples subidas simultáneas
  const uploadInProgress = useRef(false);

  const handleShopImageUpload = useCallback(async (file) => {
    if (!file) {
      throw new Error("No file provided");
    }

    if (!selectedShop?.id_shop) {
      throw new Error("No shop selected");
    }
    
    // UPDATE: Evitar múltiples cargas simultáneas
    if (uploadInProgress.current) {
      console.log('Upload already in progress, ignoring new request');
      return;
    }
    
    // UPDATE: Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(prevError => ({
        ...prevError,
        imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
      }));
      throw new Error("Formato de imagen no válido");
    }
    
    // UPDATE: Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 10MB antes de la optimización."
      }));
      throw new Error("Imagen demasiado grande");
    }

    try {
      await validateImageFile(file);

      const formData = new FormData();
      formData.append('shopImage', file);

      setUploading(true);
      uploadInProgress.current = true;

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
        console.log('-> ShopCardFunctions.jsx - handleShopImageUpload() - shops:', updatedShops);
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
      uploadInProgress.current = false;
    }
  }, [selectedShop, shops, setShops, setUploading, setError]);

  const getShopImageUrl = useCallback((imagePath) => {
    if (!imagePath) {
      console.warn('No image path provided');
      return null;
    }

    const cleanPath = imagePath.replace(/^\/+/, '');
    const baseUrl = axiosInstance.defaults.baseURL || '';
    const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");

    return imageUrl;
  }, []);

  return {
    getShopImageUrl,
    handleShopImageUpload
  };
};

export default ShopCardFunctions;