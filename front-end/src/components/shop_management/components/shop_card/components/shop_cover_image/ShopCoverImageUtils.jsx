import { useState, useContext, useCallback, useEffect, useRef } from 'react';
import AppContext from '../../../../../../app_context/AppContext.js';
import { 
  uploadShopCover, 
  formatImageUrl 
} from '../../../../../../utils/image/imageUploadService.js';

export const ShopCoverImageUtils = () => {
  const {
    setError,
    setUploading,
    selectedShop,
    setShops,
    shops,
    uploading,
    setSelectedShop
  } = useContext(AppContext);

  const [showUploadButton, setShowUploadButton] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localImageUrl, setLocalImageUrl] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  
  // UPDATE: Añadir un ref para rastrear la operación en curso
  const uploadInProgress = useRef(false);

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
    
    // UPDATE: Evitar múltiples cargas simultáneas
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
    
    // UPDATE: First validate file type before proceeding
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(prevError => ({
        ...prevError,
        imageError: "Formato de imagen no válido. Use JPEG, PNG o WebP."
      }));
      return;
    }
    
    // UPDATE: Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      setError(prevError => ({
        ...prevError,
        imageError: "La imagen es demasiado grande. Máximo 10MB antes de la optimización."
      }));
      return;
    }
    
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
    uploadInProgress.current = true;

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

      // Create a new objects to ensure React detects the state change
      const updatedSelectedShop = {
        ...selectedShop,
        image_shop: imagePath
      };
      
      // Update the shops list with the new image
      const updatedShops = shops.map(shop =>
        shop.id_shop === selectedShop.id_shop
          ? { ...shop, image_shop: imagePath }
          : shop
      );
      
      // Debug logging
      console.log('Updating shop states with new image path:', imagePath);
      console.log('Updated selected shop:', updatedSelectedShop);
      
      // Update all state in sequence to ensure UI reflects changes
      setShops(updatedShops);
      setSelectedShop(updatedSelectedShop);
      setLastUpdated(Date.now());
      
      // Keep the local image URL a bit longer for a smoother transition
      // but eventually clear it so the server image is used
      setTimeout(() => {
        setLocalImageUrl(null);
      }, 3000);
      
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
      uploadInProgress.current = false;
    }
  }, [selectedShop, shops, setShops, setSelectedShop, setError, setUploading]);

  // Get the URL for the shop cover image with cache busting
  const getShopCoverUrl = useCallback((imagePath) => {
    // If we have a local image URL (from recent upload), use that first
    if (localImageUrl) {
      return localImageUrl;
    }
    
    if (!imagePath) {
      return null;
    }
    
    // Format the server image path with a cache-busting parameter
    let result = formatImageUrl(imagePath);
    
    // Add a timestamp query parameter to prevent browser caching
    if (result) {
      result = result.includes('?') 
        ? `${result}&t=${lastUpdated}` 
        : `${result}?t=${lastUpdated}`;
    }
    
    return result;
  }, [localImageUrl, lastUpdated]);

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
    localImageUrl,
    lastUpdated
  };
};