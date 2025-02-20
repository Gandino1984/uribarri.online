import { useState, useContext } from 'react';
import AppContext from '../../../../app_context/AppContext';
import axiosInstance from '../../../../utils/app/axiosConfig.js';

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

  const handleContainerClick = (id_shop) => {
    console.log('Container clicked for shop:', id_shop);
    if (selectedShop?.id_shop === id_shop) {
      setShowUploadButton(!showUploadButton);
    }
  };

  const handleUploadButtonClick = (e) => {
    console.log('Upload button clicked');
    e.stopPropagation();
  };

  const handleShopCoverUpload = async (file) => {
    console.log('Starting shop cover upload with file:', file);
    console.log('Selected shop:', selectedShop);

    if (!file) {
      console.error('No file provided');
      throw new Error("No file provided");
    }

    if (!selectedShop?.id_shop) {
      console.error('No shop selected');
      throw new Error("No shop selected");
    }

    try {
      const formData = new FormData();
      formData.append('shopCover', file);

      console.log('FormData created:', formData);
      console.log('Shop ID being sent:', selectedShop.id_shop);

      setUploading(true);
      setUploadProgress(0);

      // Log the request configuration
      console.log('Making request to:', `${axiosInstance.defaults.baseURL}/shop/upload-cover-image`);
      console.log('Request headers:', {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': selectedShop.id_shop,
      });

      const response = await axiosInstance.post(
        '/shop/upload-cover-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Shop-ID': selectedShop.id_shop,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
            console.log('Upload progress:', progress);
          },
        }
      );

      console.log('Upload response received:', response);

      if (!response.data) {
        throw new Error('Empty response from server');
      }

      if (!response.data.data || !response.data.data.image_shop) {
        throw new Error('Invalid response structure from server');
      }

      const { image_shop } = response.data.data;
      console.log('Received image path:', image_shop);

      const updatedShops = shops.map(shop =>
        shop.id_shop === selectedShop.id_shop
          ? { ...shop, image_shop }
          : shop
      );

      console.log('Updating shops with:', updatedShops);
      setShops(updatedShops);
      setShowUploadButton(false);

      return image_shop;
    } catch (err) {
      console.error('Detailed upload error:', {
        error: err,
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError(prevError => ({
        ...prevError,
        imageError: err.response?.data?.error || err.message || "Error uploading file",
      }));
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (event, id_shop) => {
    console.log('Image upload triggered for shop:', id_shop);
    event.stopPropagation();
    
    const file = event.target.files[0];
    console.log('Selected file:', file);

    if (!file) {
      console.error('No file selected');
      setError(prevError => ({ 
        ...prevError, 
        imageError: "No file selected" 
      }));
      return;
    }

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      setError(prevError => ({
        ...prevError,
        imageError: "File size must be less than 5MB"
      }));
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      setError(prevError => ({
        ...prevError,
        imageError: "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed."
      }));
      return;
    }

    try {
      await handleShopCoverUpload(file);
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
    }
  };

  const getShopCoverUrl = (imagePath) => {
    console.log('Getting shop cover URL for path:', imagePath);
    
    if (!imagePath) {
      console.warn('No image path provided');
      return null;
    }

    try {
      const baseUrl = axiosInstance.defaults.baseURL;
      console.log('Base URL:', baseUrl);
      
      if (!baseUrl) {
        throw new Error('API base URL is not configured');
      }

      const cleanPath = imagePath.replace(/^\/+/, '');
      const imageUrl = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");
      console.log('Generated image URL:', imageUrl);

      new URL(imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error generating shop cover URL:', error);
      setError(prevError => ({
        ...prevError,
        imageError: "Error loading image URL"
      }));
      return null;
    }
  };

  return {
    handleContainerClick,
    handleUploadButtonClick,
    handleImageUpload,
    getShopCoverUrl,
    showUploadButton,
    uploading,
    uploadProgress
  };
};