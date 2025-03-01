import { useState, useContext, useCallback, useEffect } from 'react';
import AppContext from '../../../../app_context/AppContext';
import { 
  uploadShopCover, 
  formatImageUrl 
} from '../../../../utils/image/imageUploadService.js';

export const ShopCoverImageFunctions = () => {
  const {
    setError,
    setUploading,
    selectedShop,
    setShops,
    shops,
    uploading
  } = useContext(AppContext);

  const [showUploadButton, setShowUploadButton] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localImageUrl, setLocalImageUrl] = useState(null);

  // Toggle the upload button visibility when clicking the container
  const handleContainerClick = useCallback((id_shop) => {
    if (selectedShop?.id_shop === id_shop) {
      setShowUploadButton(prev => !prev);
    }
  }, [selectedShop]);

  // Prevent event propagation when clicking the upload button
  const handleUploadButtonClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Handle the image upload process
  const handleImageUpload = useCallback(async (event, id_shop) => {
    event.stopPropagation();
    
    const file = event.target.files[0];
    
    if (!file) {
      setError(prevError => ({ 
        ...prevError, 
        imageError: "No file selected" 
      }));
      return;
    }

    console.log('Starting cover image upload for shop:', selectedShop);
    
    // Create a temporary local URL for immediate display
    const localUrl = URL.createObjectURL(file);
    setLocalImageUrl(localUrl);
    
    // Log file details
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: Math.round(file.size / 1024) + 'KB'
    });

    setUploading(true);
    setUploadProgress(0);

    try {
      // Use the direct approach to ensure the field name is correct
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
          // Clear local image URL on error
          setLocalImageUrl(null);
        }
      });

      console.log('Upload successful, received path:', imagePath);

      // Update the shops list with the new image
      const updatedShops = shops.map(shop =>
        shop.id_shop === selectedShop.id_shop
          ? { ...shop, image_shop: imagePath }
          : shop
      );
      
      console.log('Updating shops with new image path');
      setShops(updatedShops);
      
      // Clean up local URL after server image is set
      setTimeout(() => {
        setLocalImageUrl(null);
      }, 1000);
      
      setShowUploadButton(false);
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      setError(prevError => ({
        ...prevError,
        imageError: error.message || "Error uploading cover image"
      }));
      // Clear local image URL on error
      setLocalImageUrl(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedShop, shops, setShops, setError, setUploading]);

  // Get the URL for the shop cover image - added support for local temp URL
  const getShopCoverUrl = useCallback((imagePath) => {
    // If we have a local image URL (from recent upload), use that first
    if (localImageUrl) {
      console.log('Using local image URL for immediate display:', localImageUrl);
      return localImageUrl;
    }
    
    // Otherwise format the server image path
    const result = formatImageUrl(imagePath);
    console.log('getShopCoverUrl input:', imagePath);
    console.log('getShopCoverUrl output:', result);
    return result;
  }, [localImageUrl]);

  // Clean up object URLs when component unmounts
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
    showUploadButton,
    uploading,
    uploadProgress,
    localImageUrl
  };
};