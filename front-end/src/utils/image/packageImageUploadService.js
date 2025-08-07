// front-end/src/utils/image/packageImageUploadService.js
import axiosInstance from '../app/axiosConfig.js';
import { optimizeImage } from './imageOptimizer.js';
import { validateImageFile } from './imageValidation.js';

/**
 * Formats package image URL from the server path
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
    
    // Combine and normalize the URL (avoid double slashes except in protocol)
    const imageUrl = `${apiBaseUrl}/${cleanPath}`.replace(/([^:]\/)(\/)+/g, "$1");
    
    console.log('Generated package image URL:', imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error formatting package image URL:', error, 'for path:', imagePath);
    return null;
  }
};

/**
 * Specialized function for uploading package images
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {number} options.shopId - ID of the shop
 * @param {number} options.packageId - ID of the package (optional for new packages)
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Image path from server
 */
export const uploadPackageImage = async ({ 
  file, 
  shopId,
  packageId = null, 
  onProgress, 
  onError 
}) => {
  if (!shopId) {
    throw new Error("Shop ID is required");
  }

  console.log('Uploading package image with:', { shopId, packageId });

  try {
    // First validate the image
    await validateImageFile(file);
    
    // Always optimize and convert to WebP
    let optimizedFile = file;
    try {
      optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        format: 'image/webp',
        maxSizeKB: 1024 // 1MB size limit
      });
      console.log('Package image optimized:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
      });
    } catch (optimizeError) {
      console.warn('Package image optimization failed, using original file:', optimizeError);
    }
    
    // Create form data with the EXACT field name expected by the backend
    const formData = new FormData();
    formData.append('packageImage', optimizedFile);
    
    // Set up upload with proper headers
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
    
    // Add package ID to headers if available (for updates)
    if (packageId) {
      config.headers['X-Package-ID'] = packageId;
    }
    
    console.log('Sending request to /package/upload-image with headers:', config.headers);
    
    // Make the request
    const response = await axiosInstance.post('/package/upload-image', formData, config);
    
    console.log('Package upload response:', response.data);
    
    if (!response.data?.data?.image_package) {
      throw new Error('Invalid response from server: missing image_package path');
    }
    
    return response.data.data.image_package;
  } catch (error) {
    console.error('Package image upload error:', error);
    
    if (onError) {
      onError(error.response?.data?.error || error.message || "Error uploading package image");
    }
    
    throw error;
  }
};