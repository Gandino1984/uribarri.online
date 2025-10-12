//update: front-end/src/utils/image/imageUploadService.js - Updated to handle backend assets paths
import axiosInstance from '../app/axiosConfig';

// Upload profile image
export const uploadProfileImage = async ({ file, userName, onProgress, onError }) => {
  try {
    if (!file || !userName) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading profile image for user:', userName);

    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('name_user', userName);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/user/upload-profile-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload profile image');
    }

    return response.data.data.image_user;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

// Upload product image
export const uploadProductImage = async ({ file, productId, shopId, onProgress, onError }) => {
  try {
    if (!file || !productId || !shopId) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading product image for product:', productId);

    const formData = new FormData();
    formData.append('productImage', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Product-ID': productId,
        'X-Shop-ID': shopId
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/product/upload-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload image');
    }

    return response.data.data.image_product;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

// Upload shop cover image
export const uploadShopCover = async ({ file, shopId, onProgress, onError }) => {
  try {
    if (!file || !shopId) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading shop cover for shop:', shopId);

    const formData = new FormData();
    formData.append('shopCover', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Shop-ID': shopId
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/shop/upload-cover-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload shop cover');
    }

    return response.data.data.image_shop;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

// Upload package image
export const uploadPackageImage = async ({ file, packageId, shopId, onProgress, onError }) => {
  try {
    if (!file || !packageId || !shopId) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading package image for package:', packageId);

    const formData = new FormData();
    formData.append('packageImage', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Package-ID': packageId,
        'X-Shop-ID': shopId
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/package/upload-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload package image');
    }

    return response.data.data.image_package;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

// Upload publication image
export const uploadPublicationImage = async ({ file, publicationId, onProgress, onError }) => {
  try {
    if (!file || !publicationId) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading publication image for publication:', publicationId);

    const formData = new FormData();
    formData.append('publicationImage', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Publication-ID': publicationId
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/publication/upload-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload publication image');
    }

    return response.data.data.image_publication;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

// Upload organization image
export const uploadOrganizationImage = async ({ file, organizationId, onProgress, onError }) => {
  try {
    if (!file || !organizationId) {
      throw new Error('Missing required parameters');
    }

    console.log('Uploading organization image for organization:', organizationId);

    const formData = new FormData();
    formData.append('organizationImage', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Organization-ID': organizationId
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    };

    const response = await axiosInstance.post('/organization/upload-image', formData, config);

    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to upload organization image');
    }

    return response.data.data.image_organization;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    if (onError) onError(errorMessage);
    throw error;
  }
};

//update: Enhanced function to format image URLs for both legacy and backend assets
export const formatImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // Remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // Get the base URL from axios instance
  const baseUrl = axiosInstance.defaults.baseURL || '';
  
  // Check if this is a backend assets path or legacy public path
  let imageUrl;
  
  if (cleanPath.startsWith('assets/images/')) {
    // This is a backend assets path, serve it directly
    imageUrl = `${baseUrl}/${cleanPath}`;
  } else if (cleanPath.startsWith('images/')) {
    // This is a legacy public path, serve it as is
    imageUrl = `${baseUrl}/${cleanPath}`;
  } else {
    // Assume it's a legacy path that needs the /images prefix
    imageUrl = `${baseUrl}/images/${cleanPath}`;
  }
  
  // Clean up any double slashes (except after http://)
  imageUrl = imageUrl.replace(/([^:]\/)(\/)+/g, "$1");
  
  console.log('Formatted image URL:', imageUrl, 'from path:', imagePath);
  
  return imageUrl;
};