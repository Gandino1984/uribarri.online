// front-end/src/utils/image/imageUploadService.js
import axiosInstance from '../app/axiosConfig.js';

/**
 * Format image URL for display
 * @param {string} imagePath - Relative path from database
 * @returns {string} - Full URL for image
 */
//update: Enhanced to properly handle assets/images paths for all image types
export const formatImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('No image path provided to format');
    return null;
  }
  
  if (typeof imagePath === 'string' && imagePath.trim() === '') {
    console.log('Empty image path provided to format');
    return null;
  }
  
  try {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    const cleanPath = imagePath.replace(/^\/+/, '');
    const baseURL = axiosInstance.defaults.baseURL;
    
    let finalPath;
    
    //update: Handle all assets/images paths (products, packages, shops, users, etc.)
    if (cleanPath.startsWith('assets/images/')) {
      finalPath = cleanPath;
    } 
    // Handle assets paths without images subdirectory
    else if (cleanPath.startsWith('assets/')) {
      finalPath = cleanPath;
    } 
    // Handle public/images paths (legacy user profiles, etc)
    else if (cleanPath.startsWith('images/')) {
      finalPath = cleanPath;
    } 
    else if (cleanPath.startsWith('public/images/')) {
      finalPath = cleanPath.replace('public/', '');
    } 
    // Default case - assume it's a relative path
    else {
      finalPath = cleanPath;
    }
    
    // Encode each path segment to handle special characters and spaces
    const pathSegments = finalPath.split('/');
    const encodedSegments = pathSegments.map(segment => {
      return encodeURIComponent(segment);
    });
    const encodedPath = encodedSegments.join('/');
    
    const fullUrl = `${baseURL}/${encodedPath}`;
    
    console.log('Formatted image URL:', {
      original: imagePath,
      clean: cleanPath,
      final: finalPath,
      encoded: encodedPath,
      fullUrl: fullUrl
    });
    
    return fullUrl;
  } catch (error) {
    console.error('Error formatting image URL:', error);
    console.error('Problem image path:', imagePath);
    return null;
  }
};

/**
 * Upload product image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file to upload
 * @param {number} options.shopId - Shop ID
 * @param {string} options.shopName - Shop name
 * @param {number} options.productId - Product ID
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
export const uploadProductImage = async ({
  file,
  shopId,
  shopName,
  productId,
  onProgress,
  onError
}) => {
  try {
    if (!file || !shopId || !productId) {
      const errorMsg = 'Missing required parameters for image upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Uploading product image:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileType: file.type,
      shopId,
      shopName,
      productId
    });

    const formData = new FormData();
    formData.append('productImage', file);

    const response = await axiosInstance.post('/product/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-shop-id': shopId,
        'x-product-id': productId
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    });

    console.log('Upload response:', response.data);

    if (response.data.error) {
      const errorMsg = response.data.error;
      console.error('Server returned error:', errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.data.data || !response.data.data.image_product) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const imagePath = response.data.data.image_product;
    console.log('Image uploaded successfully:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('Error uploading product image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Upload user profile image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file to upload
 * @param {string} options.userName - User name (not ID!)
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
export const uploadUserImage = async ({ file, userName, onProgress, onError }) => {
  try {
    if (!file || !userName) {
      const errorMsg = 'Missing required parameters for user image upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Uploading user image:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileType: file.type,
      userName
    });

    const formData = new FormData();
    formData.append('profileImage', file);

    console.log('Sending request with headers:', {
      'Content-Type': 'multipart/form-data',
      'x-user-name': userName
    });

    const response = await axiosInstance.post('/user/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-user-name': userName
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          onProgress(percentCompleted);
        }
      }
    });

    console.log('User image upload response:', response.data);

    if (response.data.error) {
      const errorMsg = response.data.error;
      console.error('Server returned error:', errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.data.data || !response.data.data.image_user) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const imagePath = response.data.data.image_user;
    console.log('User image uploaded successfully:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('Error uploading user image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading user image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

export const uploadProfileImage = uploadUserImage;

/**
 * Upload shop image
 * @param {File} file - Image file
 * @param {number} shopId - Shop ID
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Uploaded image path
 */
export const uploadShopImage = async (file, shopId, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('shopImage', file);

    const response = await axiosInstance.post('/shop/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-shop-id': shopId
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    return response.data.data.image_shop;
  } catch (error) {
    console.error('Error uploading shop image:', error);
    throw error;
  }
};

/**
 * Upload shop cover image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file
 * @param {number} options.shopId - Shop ID
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
export const uploadShopCover = async ({ file, shopId, onProgress, onError }) => {
  try {
    if (!file || !shopId) {
      const errorMsg = 'Missing required parameters for shop cover upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const formData = new FormData();
    formData.append('shopCover', file);

    const response = await axiosInstance.post('/shop/upload-cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': shopId
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    if (!response.data?.data?.image_shop) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    return response.data.data.image_shop;
  } catch (error) {
    console.error('Error uploading shop cover image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading shop cover image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Upload package image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file to upload
 * @param {number} options.shopId - Shop ID
 * @param {number} options.packageId - Package ID (can be null for new packages)
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
//update: Added package image upload function
export const uploadPackageImage = async ({
  file,
  shopId,
  packageId,
  onProgress,
  onError
}) => {
  try {
    if (!file || !shopId) {
      const errorMsg = 'Missing required parameters for package image upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Uploading package image:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileType: file.type,
      shopId,
      packageId
    });

    const formData = new FormData();
    formData.append('packageImage', file);

    const headers = {
      'Content-Type': 'multipart/form-data',
      'x-shop-id': shopId
    };

    // Only add package ID header if it exists (for updates, not new packages)
    if (packageId) {
      headers['x-package-id'] = packageId;
    }

    const response = await axiosInstance.post('/package/upload-image', formData, {
      headers: headers,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    });

    console.log('Upload response:', response.data);

    if (response.data.error) {
      const errorMsg = response.data.error;
      console.error('Server returned error:', errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.data.data || !response.data.data.image_package) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const imagePath = response.data.data.image_package;
    console.log('Package image uploaded successfully:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('Error uploading package image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading package image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Upload publication image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file to upload
 * @param {number} options.publicationId - Publication ID
 * @param {number} options.organizationId - Organization ID
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
export const uploadPublicationImage = async ({
  file,
  publicationId,
  organizationId,
  onProgress,
  onError
}) => {
  try {
    if (!file || !publicationId || !organizationId) {
      const errorMsg = 'Missing required parameters for publication image upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Uploading publication image:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileType: file.type,
      publicationId,
      organizationId
    });

    const formData = new FormData();
    formData.append('publicationImage', file);

    const response = await axiosInstance.post('/publication/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-publication-id': publicationId,
        'x-organization-id': organizationId
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    });

    console.log('Upload response:', response.data);

    if (response.data.error) {
      const errorMsg = response.data.error;
      console.error('Server returned error:', errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.data.data || !response.data.data.image_pub) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const imagePath = response.data.data.image_pub;
    console.log('Publication image uploaded successfully:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('Error uploading publication image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading publication image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Upload organization image
 * @param {Object} options - Upload options
 * @param {File} options.file - Image file to upload
 * @param {number} options.organizationId - Organization ID
 * @param {Function} options.onProgress - Progress callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<string>} - Uploaded image path
 */
//update: Fixed field name and header to match backend requirements
export const uploadOrganizationImage = async ({
  file,
  organizationId,
  onProgress,
  onError
}) => {
  try {
    if (!file || !organizationId) {
      const errorMsg = 'Missing required parameters for organization image upload';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Uploading organization image:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileType: file.type,
      organizationId
    });

    const formData = new FormData();
    //update: Changed from 'organizationImage' to 'image' to match backend middleware
    formData.append('image', file);

    const response = await axiosInstance.post('/organization/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        //update: Changed to lowercase to match backend (backend uses req.headers['x-organization-id'])
        'x-organization-id': organizationId
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) onProgress(percentCompleted);
        }
      }
    });

    console.log('Upload response:', response.data);

    if (response.data.error) {
      const errorMsg = response.data.error;
      console.error('Server returned error:', errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!response.data.data || !response.data.data.image_org) {
      const errorMsg = 'No image path returned from server';
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const imagePath = response.data.data.image_org;
    console.log('Organization image uploaded successfully:', imagePath);

    return imagePath;
  } catch (error) {
    console.error('Error uploading organization image:', error);
    
    const errorMsg = error.response?.data?.error 
      || error.response?.data?.details 
      || error.message 
      || 'Error uploading organization image';
    
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }
};

export default {
  formatImageUrl,
  uploadProductImage,
  uploadUserImage,
  uploadProfileImage,
  uploadShopImage,
  uploadShopCover,
  uploadPackageImage,
  uploadPublicationImage,
  uploadOrganizationImage
};