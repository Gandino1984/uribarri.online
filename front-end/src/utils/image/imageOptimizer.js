// utils/imageOptimizer.js

/**
 * Optimizes an image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Optimization options
 * @param {number} options.maxWidth - Maximum width (default: 1200px)
 * @param {number} options.maxHeight - Maximum height (default: 1200px)
 * @param {number} options.quality - JPEG/WebP quality (default: 0.8)
 * @param {string} options.format - Output format (default: 'image/webp')
 * @param {number} options.maxSizeKB - Maximum file size in KB (default: 1024KB = 1MB)
 * @returns {Promise<File>} - Optimized image file
 */
export const optimizeImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'image/webp', // UPDATE: Default to WebP format
      maxSizeKB = 1024 // UPDATE: Default max size 1MB (1024KB)
    } = options;

    // UPDATE: Only skip optimization if file is already WebP and under size limit
    if (file.type === 'image/webp' && file.size < maxSizeKB * 1024) {
      console.log('File is already WebP and under size limit, skipping optimization');
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
        
        // UPDATE: Function to check file size and recursively optimize if needed
        const createOptimizedFile = (blob, currentQuality) => {
          if (!blob) {
            reject(new Error('Failed to create optimized image'));
            return;
          }
          
          // UPDATE: Check if the blob is over the size limit
          if (blob.size > maxSizeKB * 1024 && currentQuality > 0.3) {
            // If still too large and we can reduce quality further
            console.log(`Image still too large (${Math.round(blob.size/1024)}KB), reducing quality further`);
            const newQuality = Math.max(currentQuality - 0.1, 0.3);
            
            // Try again with lower quality
            canvas.toBlob(
              newBlob => createOptimizedFile(newBlob, newQuality),
              'image/webp', // Force WebP format for better compression
              newQuality
            );
          } else {
            // Get file extension from MIME type
            const fileExt = outputFormat === 'image/webp' ? '.webp' : 
                           (outputFormat === 'image/png' ? '.png' : '.jpg');
                           
            // Create a new filename with the correct extension if converting to WebP
            let newFilename = file.name;
            if (outputFormat === 'image/webp' && !file.name.toLowerCase().endsWith('.webp')) {
              const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
              newFilename = `${baseName}${fileExt}`;
            }
            
            // Create optimized file
            const optimizedFile = new File(
              [blob], 
              newFilename, 
              { type: outputFormat }
            );
            
            console.log(`Optimized image: ${Math.round(file.size/1024)}KB → ${Math.round(optimizedFile.size/1024)}KB (${outputFormat})`);
            resolve(optimizedFile);
          }
        };
        
        // Convert to blob with initial quality
        canvas.toBlob(
          blob => createOptimizedFile(blob, quality),
          outputFormat, 
          quality
        );
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