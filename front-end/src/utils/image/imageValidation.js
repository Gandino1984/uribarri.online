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
      maxSize = 1 * 1024 * 1024, //update: 1MB default max size
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    } = options;

    // Check if file exists
    if (!file) {
      reject(new Error("No se ha proporcionado ningún archivo"));
      return;
    }

    //update: Don't check file size here since we'll compress it if needed
    // We'll validate the final size after optimization
    console.log(`Validating image: ${file.name}, Type: ${file.type}, Size: ${Math.round(file.size / 1024)}KB`);

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      reject(new Error(`Formato no válido. Solo se permiten: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}.`));
      return;
    }

    // Create a FileReader to check if the file is a valid image
    const reader = new FileReader();
    
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image validated successfully: ${file.name}`);
        resolve(true);
      };
      img.onerror = () => reject(new Error("El archivo no es una imagen válida"));
      img.src = reader.result;
    };
    
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};