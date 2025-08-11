// utils/image/imageValidation.js

/**
 * Validates an image file
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB for initial upload)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: common image types)
 * @returns {Promise<boolean>} - Returns true if valid, throws error if invalid
 */
export const validateImageFile = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxSize = 10 * 1024 * 1024, //update: Changed to 10MB to match backend initial limit
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    } = options;

    // Check if file exists
    if (!file) {
      reject(new Error("No se ha proporcionado ningún archivo"));
      return;
    }

    //update: Check file size against initial upload limit (10MB)
    // The backend will compress it to 1MB, but we need to accept up to 10MB initially
    if (file.size > maxSize) {
      reject(new Error(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB permitido.`));
      return;
    }

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
        
        //update: Log if image will likely be compressed by backend
        if (file.size > 1024 * 1024) {
          console.log(`Note: Image is ${Math.round(file.size / (1024 * 1024))}MB and will be compressed by the server to under 1MB`);
        }
        
        resolve(true);
      };
      img.onerror = () => reject(new Error("El archivo no es una imagen válida"));
      img.src = reader.result;
    };
    
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};