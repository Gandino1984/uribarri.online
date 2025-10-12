//update: Modified formatImageUrl to handle user images from backend API endpoint
// utils/image/imageUploadService.js
import axiosInstance from '../app/axiosConfig.js';
import { optimizeImage } from './imageOptimizer.js';
import { validateImageFile } from './imageValidation.js';

/**
 * Formats image URL from the server path
 * @param {string} imagePath - The path returned from the server
 * @returns {string|null} - Formatted URL or null if invalid
 */
export const formatImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('No image path provided to formatImageUrl');
    return null;
  }

  try {
    // If it's already a full URL (including data URLs or blob URLs)
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }

    //update: Check if this is a user image (just username)
    // User images are now served through backend API: /api/user/image/:userName
    if (!imagePath.includes('/') && !imagePath.includes('\\')) {
      // This is likely a username for a user profile image
      const apiBaseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/+$/, '');
      const imageUrl = `${apiBaseUrl}/user/image/${imagePath}`;
      console.log('Generated backend user image URL:', imageUrl);
      return imageUrl;
    }

    // For other images (shops, products, etc.) - keep old behavior
    // Use the baseURL from axios instance - strip any trailing slashes
    const apiBaseUrl = (axiosInstance.defaults.baseURL || '')
      .replace(/\/+$/, '');
    
    // Clean the path - ensure it has no leading slashes
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Combine and normalize the URL (avoid double slashes except in protocol)
    const imageUrl = `${apiBaseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");
    
    console.log('Generated image URL:', imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error formatting image URL:', error, 'for path:', imagePath);
    return null;
  }
};

/**
 * Specialized function for uploading shop cover images
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {number} options.shopId - ID of the shop
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Image path from server
 */
export const uploadShopCover = async ({ file, shopId, onProgress, onError }) => {
  if (!shopId) {
    throw new Error("No shop selected");
  }

  console.log('Uploading shop cover with shopId:', shopId);

  try {
    // First validate the image
    await validateImageFile(file);
    
    // Always optimize and convert to WebP (unless already small and WebP)
    let optimizedFile = file;
    try {
      optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'image/webp',
        maxSizeKB: 1024 // 1MB size limit
      });
      console.log('Image optimized:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
      });
    } catch (optimizeError) {
      console.warn('Image optimization failed, using original file:', optimizeError);
    }

    // Create form data with the EXACT field name expected by the backend
    const formData = new FormData();
    formData.append('shopCover', optimizedFile);

    // Set up upload with progress tracking
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': shopId
      },
      onUploadProgress: onProgress 
        ? (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        : undefined
    };

    console.log('Sending request to /shop/upload-cover-image with headers:', config.headers);

    // Make the request
    const response = await axiosInstance.post('/shop/upload-cover-image', formData, config);
    
    console.log('Upload response:', response.data);

    if (!response.data?.data?.image_shop) {
      throw new Error('Invalid response from server: missing image_shop path');
    }

    return response.data.data.image_shop;
  } catch (error) {
    console.error('Shop cover upload error:', error);
    
    if (onError) {
      onError(error.response?.data?.error || error.message || "Error uploading cover image");
    }
    
    throw error;
  }
};

/**
 * Specialized function for uploading product images
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {number} options.shopId - ID of the shop
 * @param {string} options.shopName - Name of the shop
 * @param {number} options.productId - ID of the product
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Image path from server
 */
export const uploadProductImage = async ({ 
  file, 
  shopId, 
  shopName,
  productId, 
  onProgress, 
  onError 
}) => {
  if (!shopId || !productId) {
    throw new Error("Shop ID and product ID are required");
  }

  console.log('Uploading product image with:', { shopId, shopName, productId });

  try {
    // First validate the image
    await validateImageFile(file);
    
    // Always optimize and convert to WebP (unless already small and WebP)
    let optimizedFile = file;
    try {
      optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'image/webp',
        maxSizeKB: 1024 // 1MB size limit
      });
      console.log('Image optimized:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
      });
    } catch (optimizeError) {
      console.warn('Image optimization failed, using original file:', optimizeError);
    }
    
    // Create form data with the EXACT field name expected by the backend
    const formData = new FormData();
    formData.append('productImage', optimizedFile);
    
    // Set up upload with proper headers
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': shopId,
        'X-Product-ID': productId
      },
      onUploadProgress: onProgress 
        ? (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        : undefined
    };
    
    // Add shop name to headers if available (for compatibility)
    if (shopName) {
      config.headers['X-Shop-Name'] = shopName;
    }
    
    console.log('Sending request to /product/upload-image with headers:', config.headers);
    
    // Make the request
    const response = await axiosInstance.post('/product/upload-image', formData, config);
    
    console.log('Upload response:', response.data);
    
    if (!response.data?.data?.image_product) {
      throw new Error('Invalid response from server: missing image_product path');
    }
    
    return response.data.data.image_product;
  } catch (error) {
    console.error('Product image upload error:', error);
    
    if (onError) {
      onError(error.response?.data?.error || error.message || "Error uploading product image");
    }
    
    throw error;
  }
};

/**
 * Specialized function for uploading user profile images
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {string} options.userName - Username
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Image path from server
 */
export const uploadProfileImage = async ({ 
  file, 
  userName, 
  onProgress, 
  onError 
}) => {
  if (!userName) {
    throw new Error("Username is required");
  }

  console.log('Uploading profile image for user:', userName);

  try {
    // First validate the image
    await validateImageFile(file);
    
    // Always optimize and convert to WebP for profile images
    let optimizedFile = file;
    try {
      optimizedFile = await optimizeImage(file, {
        maxWidth: 600,  // Profile images don't need to be as large as shop images
        maxHeight: 600,
        quality: 0.85,
        format: 'image/webp',
        maxSizeKB: 512 // We can use a smaller size for profile images (0.5MB)
      });
      console.log('Image optimized:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
      });
    } catch (optimizeError) {
      console.warn('Image optimization failed, using original file:', optimizeError);
    }
    
    // Create form data with the EXACT field name expected by the backend
    const formData = new FormData();
    formData.append('name_user', userName);
    formData.append('profileImage', optimizedFile);
    
    // Set up upload with progress tracking
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress 
        ? (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        : undefined
    };
    
    console.log('Sending request to /user/upload-profile-image with user:', userName);
    
    // Make the request
    const response = await axiosInstance.post('/user/upload-profile-image', formData, config);
    
    console.log('Upload response:', response.data);
    
    if (!response.data?.data?.image_user) {
      throw new Error('Invalid response from server: missing image_user path');
    }

    //update: Backend now returns just the userName, which will be used to construct /api/user/image/:userName
    return response.data.data.image_user;
  } catch (error) {
    console.error('Profile image upload error:', error);
    
    if (onError) {
      onError(error.response?.data?.error || error.message || "Error uploading profile image");
    }
    
    throw error;
  }
};