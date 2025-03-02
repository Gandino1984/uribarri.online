// utils/imageOptimizer.js

/**
 * Optimizes an image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Optimization options
 * @param {number} options.maxWidth - Maximum width (default: 1200px)
 * @param {number} options.maxHeight - Maximum height (default: 1200px)
 * @param {number} options.quality - JPEG/WebP quality (default: 0.8)
 * @param {string} options.format - Output format (default: original format)
 * @returns {Promise<File>} - Optimized image file
 */
export const optimizeImage = (file, options = {}) => {
    return new Promise((resolve, reject) => {
      const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        format = null
      } = options;
  
      // If the file is already small, return it as is
      if (file.size < 150 * 1024) { // Less than 150KB
        resolve(file);
        return;
      }
  
      // Read the file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Determine if resizing is needed
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          // Create canvas for the resized image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          
          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determine output format
          let outputFormat = format;
          if (!outputFormat) {
            // Use original format if not specified
            outputFormat = file.type;
          }
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create optimized image'));
              return;
            }
            
            // Create optimized file
            const optimizedFile = new File(
              [blob], 
              file.name, 
              { type: outputFormat }
            );
            
            resolve(optimizedFile);
          }, outputFormat, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for optimization'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
    });
  };
  
  /**
   * Gets dimensions and format info about an image file
   * @param {File} file - Image file to analyze
   * @returns {Promise<Object>} - Image information
   */
  export const getImageInfo = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            type: file.type,
            size: file.size,
            sizeInKB: Math.round(file.size / 1024)
          });
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for analysis'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
    });
  };