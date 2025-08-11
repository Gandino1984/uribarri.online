// back-end/utils/imageConversionUtils.js
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Process and optimize an uploaded image
 * Converts to WebP format and ensures file size is under 1MB
 * @param {Object} file - Multer file object
 * @param {number} maxSizeKB - Maximum file size in KB (default: 1024 = 1MB)
 * @returns {Promise<Object>} - Updated file object with new path and info
 */
export async function processUploadedImage(file, maxSizeKB = 1024) {
  if (!file || !file.path) {
    throw new Error('No file provided for processing');
  }

  console.log('Processing uploaded image:', {
    filename: file.filename,
    path: file.path,
    size: Math.round(file.size / 1024) + 'KB',
    mimetype: file.mimetype
  });

  try {
    // Verify the input file exists
    await fs.access(file.path);
    console.log('✓ Input file exists:', file.path);
    
    const originalPath = file.path;
    const directory = path.dirname(originalPath);
    const baseName = path.basename(file.filename, path.extname(file.filename));
    
    // Generate new filename with .webp extension
    const newFilename = `${baseName}.webp`;
    const newPath = path.join(directory, newFilename);

    console.log('Converting to WebP:', {
      from: originalPath,
      to: newPath
    });

    // Initial quality setting
    let quality = 85;
    let width = 1200;
    let height = 1200;
    let outputBuffer;
    let attempts = 0;
    const maxAttempts = 10;
    const maxSizeBytes = maxSizeKB * 1024;

    // Get original image metadata
    const metadata = await sharp(originalPath).metadata();
    console.log('Original image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size
    });

    // Calculate initial dimensions maintaining aspect ratio
    if (metadata.width > width || metadata.height > height) {
      const ratio = Math.min(width / metadata.width, height / metadata.height);
      width = Math.floor(metadata.width * ratio);
      height = Math.floor(metadata.height * ratio);
    } else {
      width = metadata.width;
      height = metadata.height;
    }

    // Iteratively optimize until under size limit
    while (attempts < maxAttempts) {
      attempts++;
      
      console.log(`Optimization attempt ${attempts}: quality=${quality}, dimensions=${width}x${height}`);
      
      // Process the image
      outputBuffer = await sharp(originalPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toBuffer();
      
      const outputSize = outputBuffer.length;
      console.log(`Attempt ${attempts} output size: ${Math.round(outputSize / 1024)}KB`);
      
      // Check if size is acceptable
      if (outputSize <= maxSizeBytes) {
        console.log(`✓ Success! Image optimized to ${Math.round(outputSize / 1024)}KB`);
        break;
      }
      
      // If still too large, adjust parameters
      if (quality > 30) {
        // First try reducing quality
        quality = Math.max(quality - 10, 30);
      } else {
        // If quality is at minimum, reduce dimensions
        width = Math.floor(width * 0.9);
        height = Math.floor(height * 0.9);
        quality = 70; // Reset quality when scaling down
        
        // Don't go below 400px
        if (width < 400 || height < 400) {
          console.warn('Cannot optimize further without significant quality loss');
          break;
        }
      }
    }

    // Write the optimized image
    await fs.writeFile(newPath, outputBuffer);
    console.log('✓ WebP file written:', newPath);
    
    // Verify the new file exists
    await fs.access(newPath);
    console.log('✓ WebP file verified on disk');
    
    // Delete the original file if it's different from the new one
    if (originalPath !== newPath) {
      try {
        await fs.unlink(originalPath);
        console.log('✓ Deleted original file:', originalPath);
      } catch (err) {
        console.error('Error deleting original file:', err);
      }
    }

    // Get the final file stats
    const stats = await fs.stat(newPath);
    
    // Return updated file object
    return {
      ...file,
      filename: newFilename,
      path: newPath,
      size: stats.size,
      mimetype: 'image/webp'
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Delete an image file and optionally its directory if empty
 * @param {string} imagePath - Path to the image file
 * @param {boolean} deleteEmptyDir - Whether to delete directory if empty
 */
export async function deleteImageFile(imagePath, deleteEmptyDir = false) {
  try {
    // Check if file exists
    await fs.access(imagePath);
    
    // Delete the file
    await fs.unlink(imagePath);
    console.log('Deleted image file:', imagePath);
    
    if (deleteEmptyDir) {
      const directory = path.dirname(imagePath);
      
      // Check if directory is empty
      const files = await fs.readdir(directory);
      if (files.length === 0) {
        await fs.rmdir(directory);
        console.log('Deleted empty directory:', directory);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
}

export default {
  processUploadedImage,
  deleteImageFile
};