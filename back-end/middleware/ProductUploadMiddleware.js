import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import shop_model from '../models/shop_model.js';
import { validateImageMiddleware } from '../utils/imageValidationUtilities.js';
import { processUploadedImage } from '../utils/imageConversionUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to ensure directory exists with proper permissions
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
    console.log(`Directory created: ${dirPath}`);
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

//update: Added function to clean existing product images before saving new ones
const cleanExistingProductImages = async (dirPath, productId) => {
  try {
    // Check if directory exists first
    try {
      await fs.access(dirPath);
    } catch (err) {
      // Directory doesn't exist, nothing to clean
      return;
    }
    
    // Read all files in the directory
    const files = await fs.readdir(dirPath);
    
    if (!files || files.length === 0) {
      return;
    }
    
    // Filter files that match this product ID
    const productFiles = files.filter(file => 
      file.includes(`product_${productId}`) || 
      file.includes(`temp_${productId}`)
    );
    
    if (productFiles.length === 0) {
      return;
    }
    
    console.log(`Cleaning ${productFiles.length} existing images for product ${productId}`);
    
    // Delete each matching file
    for (const file of productFiles) {
      const filePath = path.join(dirPath, file);
      await fs.unlink(filePath);
      console.log(`Deleted existing product image: ${filePath}`);
    }
  } catch (error) {
    console.error('Error cleaning existing product images:', error);
    // Don't throw, just log error and continue
  }
};

const productImageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log('Multer processing product image:', file.fieldname, file.originalname);
    
    const shopId = req.headers['x-shop-id'];
    const productId = req.headers['x-product-id'];

    if (!shopId || !productId) {
      return cb(new Error('Shop ID and Product ID are required'));
    }

    try {
      // Fetch shop details to get the shop name
      const shop = await shop_model.findByPk(shopId);
      
      if (!shop) {
        return cb(new Error('Shop not found'));
      }
      
      const shopName = shop.name_shop;
      console.log(`Found shop name: ${shopName} for ID: ${shopId}, product ID: ${productId}`);
      
      // Create path for shop-specific product images - use forward slashes for Docker compatibility
      const uploadsDir = path.join(
        __dirname, 
        '..',
        '..',
        'public', 
        'images', 
        'uploads', 
        'shops', 
        shopName, 
        'product_images'
      );

      console.log(`Attempting to create directory: ${uploadsDir}`);
      
      // Ensure the directory exists
      await ensureDirectoryExists(uploadsDir);
      
      //update: Clean existing product images before saving new one
      await cleanExistingProductImages(uploadsDir, productId);
      
      console.log(`Product image will be stored in: ${uploadsDir}`);
      
      // Make sure permissions are set correctly (important for Docker)
      try {
        await fs.chmod(uploadsDir, 0o755);
      } catch (chmodError) {
        console.warn('Could not set directory permissions:', chmodError.message);
      }
      
      cb(null, uploadsDir);
    } catch (error) {
      console.error('Error setting up upload directory:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const productId = req.headers['x-product-id'];
    //update: Use temporary filename since we'll rename after WebP conversion
    const tempFileName = `temp_${productId}_${Date.now()}${path.extname(file.originalname)}`;
    console.log(`Generated temporary filename: ${tempFileName}`);
    cb(null, tempFileName);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter checking:', file.fieldname, file.mimetype);
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed. Received: ${file.mimetype}`), false);
  }
};

const uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 //update: Increased to 10MB limit for initial upload (we'll compress it later)
  }
}).single('productImage'); // IMPORTANT: This must match the field name from the frontend

const handleProductImageUpload = async (req, res, next) => {
  console.log('Starting product image upload handler');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', req.headers);
  
  uploadProductImage(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'El archivo es demasiado grande. Máximo 10MB permitido para procesamiento.',
          details: err.message,
          code: err.code,
          field: err.field
        });
      }
      return res.status(400).json({
        error: 'Error uploading file',
        details: err.message,
        code: err.code,
        field: err.field
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: 'Error uploading product image',
        details: err.message
      });
    }
    
    console.log('Product image upload processed successfully');
    
    if (!req.file) {
      console.warn('No file data in request after processing');
      return res.status(400).json({
        error: 'No se ha proporcionado ningún archivo'
      });
    }
    
    console.log('Uploaded file details:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    
    try {
      // Validate the image
      await validateImageMiddleware(req, res, async () => {
        try {
          //update: Process the image (convert to WebP and compress to 1MB)
          console.log('Processing uploaded image for WebP conversion and compression...');
          const processedFile = await processUploadedImage(req.file);
          
          //update: Rename the processed file to 'product_[id].webp'
          const productId = req.headers['x-product-id'];
          const finalFilename = `product_${productId}.webp`;
          const finalPath = path.join(path.dirname(processedFile.path), finalFilename);
          
          // If the processed file is not already named correctly, rename it
          if (processedFile.filename !== finalFilename) {
            // If a file with this name already exists, it should have been cleaned up,
            // but let's make sure
            try {
              await fs.unlink(finalPath);
            } catch (unlinkErr) {
              // File doesn't exist, which is fine
            }
            
            // Rename the processed file
            await fs.rename(processedFile.path, finalPath);
            
            // Update the file object
            processedFile.path = finalPath;
            processedFile.filename = finalFilename;
          }
          
          // Update req.file with the processed file info
          req.file = processedFile;
          
          const stats = await fs.stat(finalPath);
          console.log('Image processed successfully:', {
            filename: processedFile.filename,
            size: Math.round(stats.size / 1024) + 'KB',
            type: processedFile.mimetype,
            path: processedFile.path
          });
          
          next();
        } catch (processError) {
          console.error('Error processing image:', processError);
          
          // Clean up the file if processing failed
          if (req.file && req.file.path) {
            try {
              await fs.unlink(req.file.path);
            } catch (cleanupError) {
              console.error('Error cleaning up file:', cleanupError);
            }
          }
          
          return res.status(500).json({
            error: 'Error al procesar la imagen',
            details: processError.message
          });
        }
      });
    } catch (validationError) {
      // Validation error is already handled by validateImageMiddleware
      console.error('Image validation failed:', validationError);
    }
  });
};

export { handleProductImageUpload };