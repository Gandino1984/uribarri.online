import { useState, useCallback, useEffect, useRef } from 'react';
import { useUI } from '../../../../../../app_context/UIContext.jsx';
import { useShop } from '../../../../../../app_context/ShopContext.jsx';
import { 
  uploadShopCover, 
  formatImageUrl 
} from '../../../../../../utils/image/imageUploadService.js';

export const ShopCoverImageUtils = () => {
  const { setError, setUploading, uploading } = useUI();
  //update: Added setSelectedShop to update selected shop when image changes
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
      const imagePath = await uploadShopCover({
        file,
        shopId: selectedShop.id_shop,
        onProgress: (progress) => {
          console.log('Upload progress:', progress);
          setUploadProgress(progress);
        },
        onError: (errorMessage) => {
          console.error('Upload error:', errorMessage);
          setError(prevError => ({
            ...prevError,
            imageError: errorMessage
          }));
          setLocalImageUrl(null);
        }
      });

      console.log('Upload successful, received path:', imagePath);

      //update: Update both selectedShop and shops array
      const updatedSelectedShop = {
        ...selectedShop,
        image_shop: imagePath
      };
      
      const updatedShops = shops.map(shop =>
        shop.id_shop === selectedShop.id_shop
          ? { ...shop, image_shop: imagePath }
          : shop
      );
      
      console.log('Updating shop states with new image path:', imagePath);
      console.log('Updated selected shop:', updatedSelectedShop);
      
      //update: Update both shops array AND selectedShop to keep them in sync
      setShops(updatedShops);
      setSelectedShop(updatedSelectedShop);
      setLastUpdated(Date.now());
      
      //update: Clear local URL immediately and rely on server path
      setTimeout(() => {
        setLocalImageUrl(null);
      }, 500);
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      setError(prevError => ({
        ...prevError,
        imageError: error.message || "Error uploading cover image"
      }));
      setLocalImageUrl(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      uploadInProgress.current = false;
    }
  }, [selectedShop, shops, setShops, setSelectedShop, setError, setUploading]);

  const getShopCoverUrl = useCallback((imagePath) => {
    if (localImageUrl) {
      return localImageUrl;
    }
    
    if (!imagePath) {
      return null;
    }
    
    let result = formatImageUrl(imagePath);
    
    if (result) {
      result = result.includes('?') 
        ? `${result}&t=${lastUpdated}` 
        : `${result}?t=${lastUpdated}`;
    }
    
    return result;
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