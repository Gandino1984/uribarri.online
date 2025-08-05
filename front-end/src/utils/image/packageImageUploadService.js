// utils/image/packageImageUploadService.js
import axiosInstance from '../app/axiosConfig.js';
import { optimizeImage } from './imageOptimizer.js';
import { validateImageFile } from './imageValidation.js';
import { formatImageUrl } from './imageUploadService.js';

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
  packageId, 
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
      console.log('Image optimized:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        optimizedSize: Math.round(optimizedFile.size / 1024) + 'KB'
      });
    } catch (optimizeError) {
      console.warn('Image optimization failed, using original file:', optimizeError);
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
    
    console.log('Upload response:', response.data);
    
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

// Export formatImageUrl from the main image upload service
export { formatImageUrl } from './imageUploadService.js';