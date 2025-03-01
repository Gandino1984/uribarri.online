import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import shop_model from '../models/shop_model.js';

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
    // Use a consistent naming pattern for product images
    const fileName = `product_${productId}${path.extname(file.originalname).toLowerCase()}`;
    console.log(`Generated filename: ${fileName}`);
    cb(null, fileName);
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('productImage'); // IMPORTANT: This must match the field name from the frontend

const handleProductImageUpload = async (req, res, next) => {
  console.log('Starting product image upload handler');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', req.headers);
  
  uploadProductImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
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
    if (req.file) {
      console.log('Uploaded file details:', {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });
    } else {
      console.warn('No file data in request after processing');
    }
    
    next();
  });
};

export { handleProductImageUpload };