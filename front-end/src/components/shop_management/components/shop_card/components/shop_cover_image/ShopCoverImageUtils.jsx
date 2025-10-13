import { useState, useCallback, useEffect, useRef } from 'react';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { formatImageUrl } from '../../../../../../utils/image/imageUploadService.js';
import axiosInstance from '../../../../../../utils/app/axiosConfig.js';

export const ShopCoverImageUtils = () => {
  const { setError, setUploading, uploading } = useUI();
  const { selectedShop, setShops, shops, setSelectedShop } = useShop();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [localImageUrl, setLocalImageUrl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  const uploadInProgress = useRef(false);

  const handleContainerClick = useCallback((id_shop) => {
    console.log('Container clicked for shop:', id_shop);
  }, []);

  const handleUploadButtonClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleImageUpload = useCallback(async (event, id_shop) => {
    event.stopPropagation();
    
    if (uploadInProgress.current) {
      console.log('Upload already in progress, ignoring new request');
      return;
    }
    
    const file = event.target.files[0];
    
    if (!file) {
      setError(prevError => ({ 
        ...prevError, 
        imageError: "No file selected" 
      }));
      return;
    }

    console.log('Starting cover image upload for shop:', selectedShop);
    console.log('Shop ID from parameter:', id_shop);
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(prevError => ({
        ...prevError,
        imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
      }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 10MB antes de la optimización."
      }));
      return;
    }
    
    //update: Create local preview URL
    const localUrl = URL.createObjectURL(file);
    setLocalImageUrl(localUrl);
    
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: Math.round(file.size / 1024) + 'KB'
    });

    setUploading(true);
    setUploadProgress(0);
    uploadInProgress.current = true;

    try {
      const formData = new FormData();
      formData.append('shopCover', file);
      
      //update: Use the id_shop parameter instead of selectedShop.id_shop for more reliability
      const shopId = id_shop || selectedShop?.id_shop;
      
      if (!shopId) {
        throw new Error('No shop ID available for upload');
      }
      
      console.log('Uploading to shop ID:', shopId);
      
      const response = await axiosInstance.post('/shop/upload-cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Shop-ID': shopId
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', progress);
            setUploadProgress(progress);
          }
        }
      });

      console.log('Upload response:', response.data);

      if (!response.data?.data?.image_shop) {
        throw new Error('No image path returned from server');
      }

      const imagePath = response.data.data.image_shop;
      console.log('Upload successful, received path:', imagePath);

      //update: Update both selectedShop and shops array
      // This ensures the image displays immediately for both new and existing shops
      const updatedShopData = {
        image_shop: imagePath
      };
      
      //update: Update the shops array
      const updatedShops = shops.map(shop =>
        shop.id_shop === shopId
          ? { ...shop, ...updatedShopData }
          : shop
      );
      
      console.log('Updated shops array with new image path');
      setShops(updatedShops);
      
      //update: Update selectedShop if it matches the uploaded shop
      if (selectedShop?.id_shop === shopId) {
        const updatedSelectedShop = {
          ...selectedShop,
          ...updatedShopData
        };
        console.log('Updated selected shop with new image path:', updatedSelectedShop);
        setSelectedShop(updatedSelectedShop);
      }
      
      //update: Force a re-render by updating the timestamp
      setLastUpdated(Date.now());
      
      //update: Clear local preview after a short delay to allow state updates to propagate
      setTimeout(() => {
        setLocalImageUrl(null);
        URL.revokeObjectURL(localUrl);
      }, 1000);
      
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      setError(prevError => ({
        ...prevError,
        imageError: error.response?.data?.error || error.message || "Error uploading cover image"
      }));
      
      //update: Clean up local preview on error
      if (localUrl) {
        setLocalImageUrl(null);
        URL.revokeObjectURL(localUrl);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      uploadInProgress.current = false;
      
      event.target.value = '';
    }
  }, [selectedShop, shops, setShops, setSelectedShop, setError, setUploading]);

  //update: Use the centralized formatImageUrl function for consistent URL construction
  const getShopCoverUrl = useCallback((imagePath) => {
    if (localImageUrl) {
      console.log('Using local preview URL:', localImageUrl);
      return localImageUrl;
    }
    
    if (!imagePath) {
      console.log('No image path provided to getShopCoverUrl');
      return null;
    }
    
    // Use the centralized formatImageUrl function from imageUploadService
    const formattedUrl = formatImageUrl(imagePath);
    
    if (!formattedUrl) {
      console.error('Failed to format image URL for path:', imagePath);
      return null;
    }
    
    // Add cache busting timestamp
    const urlWithTimestamp = formattedUrl.includes('?') 
      ? `${formattedUrl}&t=${lastUpdated}` 
      : `${formattedUrl}?t=${lastUpdated}`;
    
    console.log('Shop cover URL constructed:', {
      original: imagePath,
      formatted: urlWithTimestamp
    });
    
    return urlWithTimestamp;
  }, [localImageUrl, lastUpdated]);

  useEffect(() => {
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
      }
    };
  }, [localImageUrl]);

  return {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    uploading,
    uploadProgress,
    localImageUrl,
    lastUpdated
  };
};