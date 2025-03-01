// utils/imageUploadService.js
import axiosInstance from '../app/axiosConfig.js';
import { optimizeImage } from './imageOptimizer.js';

/**
 * Validates an image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: common image types)
 * @returns {Promise<boolean>} - Returns true if valid, throws error if invalid
 */
export const validateImageFile = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    } = options;

    // Check if file exists
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      reject(new Error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`));
      return;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`Invalid file type. Only ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} are allowed.`));
      return;
    }

    // Create a FileReader to check if the file is a valid image
    const reader = new FileReader();
    
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error("File is not a valid image"));
      img.src = reader.result;
    };
    
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsDataURL(file);
  });
};

// utils/imageUploadService.js - Updated formatImageUrl function

// Updated formatImageUrl function for imageUploadService.js

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

    // Use the baseURL from axios instance - strip any trailing slashes
    const apiBaseUrl = (axiosInstance.defaults.baseURL || '')
      .replace(/\/+$/, '');
    
    // Clean the path - ensure it has no leading slashes
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Make sure we're not duplicating parts of the path
    let finalPath = cleanPath;
    
    // Combine and normalize the URL (avoid double slashes except in protocol)
    const imageUrl = `${apiBaseUrl}/${finalPath}`.replace(/([^:]\/)(\/)+/g, "$1");
    
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
    // First optimize the image
    let optimizedFile = file;
    if (file.size > 150 * 1024) { // Only optimize if larger than 150KB
      try {
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85
        });
        console.log('Image optimized:', {
          originalSize: Math.round(file.size / 1024) + 'KB',
          optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
        });
      } catch (optimizeError) {
        console.warn('Image optimization failed, using original file:', optimizeError);
      }
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

    console.log('Sending request to /shop/upload-cover-image with headers:', {
      'X-Shop-ID': shopId,
      'Content-Type': 'multipart/form-data'
    });

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
 * Specialized function for uploading shop profile images
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {number} options.shopId - ID of the shop
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Image path from server
 */
export const uploadShopImage = async ({ file, shopId, onProgress, onError }) => {
  if (!shopId) {
    throw new Error("No shop selected");
  }

  try {
    // Optimize image first
    let optimizedFile = file;
    if (file.size > 150 * 1024) {
      try {
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85
        });
      } catch (optimizeError) {
        console.warn('Image optimization failed, using original file');
      }
    }
    
    // Create form data with correct field name
    const formData = new FormData();
    formData.append('shopImage', optimizedFile);
    
    // Make the request with proper headers
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
    
    const response = await axiosInstance.post('/shop/upload-image', formData, config);
    
    if (!response.data?.data?.image_shop) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data.image_shop;
  } catch (error) {
    if (onError) {
      onError(error.response?.data?.error || error.message);
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
  if (!shopId || !shopName || !productId) {
    throw new Error("Shop and product information is required");
  }

  try {
    // Optimize image first
    let optimizedFile = file;
    if (file.size > 150 * 1024) {
      try {
        optimizedFile = await optimizeImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85
        });
      } catch (optimizeError) {
        console.warn('Image optimization failed, using original file');
      }
    }
    
    // Create form data with correct field name
    const formData = new FormData();
    formData.append('productImage', optimizedFile);
    
    // Make the request with proper headers
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': shopId,
        'X-Shop-Name': shopName,
        'X-Product-ID': productId
      },
      onUploadProgress: onProgress 
        ? (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        : undefined
    };
    
    const response = await axiosInstance.post('/product/upload-image', formData, config);
    
    if (!response.data?.data?.image_product) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data.image_product;
  } catch (error) {
    if (onError) {
      onError(error.response?.data?.error || error.message);
    }
    throw error;
  }
};