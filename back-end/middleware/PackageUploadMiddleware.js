// back-end/middleware/PackageUploadMiddleware.js
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
    // Check if directory exists
    try {
      await fs.access(dirPath);
      console.log(`Directory already exists: ${dirPath}`);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
      console.log(`Directory created successfully: ${dirPath}`);
    }
    
    // Try to set permissions (may fail in Docker, that's ok)
    try {
      await fs.chmod(dirPath, 0o755);
    } catch (chmodError) {
      console.warn('Could not set directory permissions:', chmodError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring directory exists:', error);
    throw error;
  }
};

//update: Function to clean existing package images before saving new ones
const cleanExistingPackageImages = async (dirPath, packageId) => {
  try {
    // Check if directory exists first
    try {
      await fs.access(dirPath);
    } catch (err) {
      // Directory doesn't exist, nothing to clean
      console.log('Directory does not exist yet, nothing to clean');
      return;
    }
    
    // Read all files in the directory
    const files = await fs.readdir(dirPath);
    
    if (!files || files.length === 0) {
      console.log('No files to clean in directory');
      return;
    }
    
    // Filter files that match this package ID
    const packageFiles = files.filter(file => 
      file.includes(`package_${packageId}`) || 
      file.includes(`temp_package_${packageId}`)
    );
    
    if (packageFiles.length === 0) {
      console.log('No existing package files to clean');
      return;
    }
    
    console.log(`Cleaning ${packageFiles.length} existing images for package ${packageId}`);
    
    // Delete each matching file
    for (const file of packageFiles) {
      const filePath = path.join(dirPath, file);
      await fs.unlink(filePath);
      console.log(`Deleted existing package image: ${filePath}`);
    }
  } catch (error) {
    console.error('Error cleaning existing package images:', error);
    // Don't throw, just log error and continue
  }
};

const packageImageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log('=== Package Image Upload - Setting Destination ===');
    console.log('Processing file:', file.fieldname, file.originalname);
    
    const shopId = req.headers['x-shop-id'];
    const packageId = req.headers['x-package-id'];
    
    console.log('Shop ID:', shopId);
    console.log('Package ID:', packageId);

    if (!shopId) {
      return cb(new Error('Shop ID is required'));
    }

    try {
      // Fetch shop details to get the shop name
      const shop = await shop_model.findByPk(shopId);
      
      if (!shop) {
        return cb(new Error('Shop not found'));
      }
      
      const shopName = shop.name_shop;
      console.log(`Found shop: ${shopName} (ID: ${shopId})`);
      
      // Create path for shop-specific package images
      // Use absolute path to ensure correct location
      const projectRoot = path.resolve(__dirname, '..', '..');
      const uploadsDir = path.join(
        projectRoot,
        'public', 
        'images', 
        'uploads', 
        'shops', 
        shopName, 
        'package_images'
      );

      console.log(`Target directory path: ${uploadsDir}`);
      
      // Ensure all parent directories exist
      const shopsDir = path.join(projectRoot, 'public', 'images', 'uploads', 'shops');
      const shopDir = path.join(shopsDir, shopName);
      
      // Create directories step by step
      await ensureDirectoryExists(path.join(projectRoot, 'public'));
      await ensureDirectoryExists(path.join(projectRoot, 'public', 'images'));
      await ensureDirectoryExists(path.join(projectRoot, 'public', 'images', 'uploads'));
      await ensureDirectoryExists(shopsDir);
      await ensureDirectoryExists(shopDir);
      await ensureDirectoryExists(uploadsDir);
      
      // Clean existing package images if packageId is provided (for updates)
      if (packageId) {
        await cleanExistingPackageImages(uploadsDir, packageId);
      }
      
      console.log(`Package image will be stored in: ${uploadsDir}`);
      
      // Verify the directory was created
      try {
        await fs.access(uploadsDir);
        console.log('✓ Directory verified and accessible');
      } catch (err) {
        console.error('✗ Directory not accessible after creation:', err);
        throw err;
      }
      
      cb(null, uploadsDir);
    } catch (error) {
      console.error('Error setting up upload directory:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const packageId = req.headers['x-package-id'];
    // Use temporary filename since we'll rename after WebP conversion
    const tempFileName = packageId 
      ? `temp_package_${packageId}_${Date.now()}${path.extname(file.originalname)}`
      : `temp_package_new_${Date.now()}${path.extname(file.originalname)}`;
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

const uploadPackageImage = multer({
  storage: packageImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for initial upload
  }
}).single('packageImage'); // This must match the field name from the frontend

const handlePackageImageUpload = async (req, res, next) => {
  console.log('=== Starting Package Image Upload Handler ===');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', {
    'x-shop-id': req.headers['x-shop-id'],
    'x-package-id': req.headers['x-package-id']
  });
  
  uploadPackageImage(req, res, async function (err) {
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
        error: 'Error uploading package image',
        details: err.message
      });
    }
    
    console.log('Package image upload processed by multer successfully');
    
    if (!req.file) {
      console.warn('No file data in request after processing');
      return res.status(400).json({
        error: 'No se ha proporcionado ningún archivo'
      });
    }
    
    console.log('Uploaded file details:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Verify the file was actually saved
    try {
      await fs.access(req.file.path);
      console.log('✓ File verified on disk at:', req.file.path);
    } catch (verifyError) {
      console.error('✗ File not found on disk:', verifyError);
      return res.status(500).json({
        error: 'Error al guardar el archivo',
        details: 'El archivo no se guardó correctamente'
      });
    }
    
    try {
      // Validate the image
      await validateImageMiddleware(req, res, async () => {
        try {
          console.log('Processing uploaded image for WebP conversion and compression...');
          
          // Process the image (convert to WebP and compress to 1MB)
          const processedFile = await processUploadedImage(req.file);
          
          console.log('Image processed:', {
            original: req.file.filename,
            processed: processedFile.filename,
            size: Math.round(processedFile.size / 1024) + 'KB'
          });
          
          // Rename the processed file to 'package_[id].webp' if we have a package ID
          const packageId = req.headers['x-package-id'];
          if (packageId) {
            const finalFilename = `package_${packageId}.webp`;
            const finalPath = path.join(path.dirname(processedFile.path), finalFilename);
            
            console.log(`Renaming ${processedFile.filename} to ${finalFilename}`);
            
            // If a file with this name already exists, delete it
            try {
              await fs.unlink(finalPath);
              console.log('Deleted existing file with same name');
            } catch (unlinkErr) {
              // File doesn't exist, which is fine
            }
            
            // Rename the processed file
            await fs.rename(processedFile.path, finalPath);
            console.log('✓ File renamed successfully');
            
            // Update the file object
            processedFile.path = finalPath;
            processedFile.filename = finalFilename;
          }
          
          // Update req.file with the processed file info
          req.file = processedFile;
          
          // Verify the final file exists
          const stats = await fs.stat(processedFile.path);
          console.log('✓ Final image file verified:', {
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
              console.log('Cleaned up failed upload file');
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

export { handlePackageImageUpload };