// utils/image/imageValidation.js

/**
 * Validates an image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 1MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: common image types)
 * @returns {Promise<boolean>} - Returns true if valid, throws error if invalid
 */
export const validateImageFile = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxSize = 1 * 1024 * 1024, // UPDATE: 1MB default max size
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