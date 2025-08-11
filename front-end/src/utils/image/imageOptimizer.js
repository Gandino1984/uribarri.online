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
      format = 'image/webp', //update: Always default to WebP format
      maxSizeKB = 1024 //update: Default max size 1MB (1024KB)
    } = options;

    //update: Always convert to WebP, don't skip optimization
    console.log('Starting image optimization for:', file.name, 'Size:', Math.round(file.size/1024) + 'KB');

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
        
        //update: Always use WebP format for output
        const outputFormat = 'image/webp';
        
        //update: Function to check file size and recursively optimize if needed
        const createOptimizedFile = (blob, currentQuality, currentScale = 1) => {
          if (!blob) {
            reject(new Error('Failed to create optimized image'));
            return;
          }
          
          const sizeInKB = Math.round(blob.size / 1024);
          console.log(`Optimization attempt - Quality: ${currentQuality}, Scale: ${currentScale}, Size: ${sizeInKB}KB`);
          
          //update: Check if the blob is over the size limit
          if (blob.size > maxSizeKB * 1024) {
            // If quality can still be reduced
            if (currentQuality > 0.1) {
              const newQuality = Math.max(currentQuality - 0.1, 0.1);
              console.log(`Image still too large (${sizeInKB}KB), reducing quality to ${newQuality}`);
              
              canvas.toBlob(
                newBlob => createOptimizedFile(newBlob, newQuality, currentScale),
                outputFormat,
                newQuality
              );
            } 
            // If quality is at minimum, reduce dimensions
            else if (currentScale > 0.5) {
              const newScale = currentScale - 0.1;
              const newWidth = Math.floor(width * newScale);
              const newHeight = Math.floor(height * newScale);
              
              console.log(`Quality at minimum, reducing dimensions to ${newWidth}x${newHeight}`);
              
              // Create a new canvas with smaller dimensions
              const smallerCanvas = document.createElement('canvas');
              const smallerCtx = smallerCanvas.getContext('2d');
              smallerCanvas.width = newWidth;
              smallerCanvas.height = newHeight;
              smallerCtx.drawImage(img, 0, 0, newWidth, newHeight);
              
              // Try again with the smaller canvas
              smallerCanvas.toBlob(
                newBlob => createOptimizedFile(newBlob, 0.8, newScale), // Reset quality when scaling down
                outputFormat,
                0.8
              );
            } else {
              // If we've tried everything and still can't get under 1MB, use the current result
              console.warn(`Could not optimize image to under ${maxSizeKB}KB. Final size: ${sizeInKB}KB`);
              
              //update: Create the file with WebP extension
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const newFilename = `${baseName}.webp`;
              
              const optimizedFile = new File(
                [blob], 
                newFilename, 
                { type: outputFormat }
              );
              
              resolve(optimizedFile);
            }
          } else {
            //update: Success! Create the file with WebP extension
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFilename = `${baseName}.webp`;
            
            const optimizedFile = new File(
              [blob], 
              newFilename, 
              { type: outputFormat }
            );
            
            console.log(`Successfully optimized: ${Math.round(file.size/1024)}KB → ${Math.round(optimizedFile.size/1024)}KB (${outputFormat})`);
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