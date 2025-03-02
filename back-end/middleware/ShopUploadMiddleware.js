import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import shop_model from '../models/shop_model.js'; // Import shop model to get shop name

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

const shopCoverStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        console.log('Multer processing file:', file.fieldname, file.originalname);
        
        const id_shop = req.headers['x-shop-id'];

        if (!id_shop) {
            return cb(new Error('Shop ID is required'));
        }

        try {
            // Fetch shop details to get the shop name
            const shop = await shop_model.findByPk(id_shop);
            
            if (!shop) {
                return cb(new Error('Shop not found'));
            }
            
            const shopName = shop.name_shop;
            console.log(`Found shop name: ${shopName} for ID: ${id_shop}`);
            
            // Create path for shop-specific cover images - use forward slashes for Docker compatibility
            const uploadsDir = path.join(
                __dirname, 
                '..',
                '..',
                'public', 
                'images', 
                'uploads', 
                'shops', 
                shopName, 
                'cover_image'
            );

            console.log(`Attempting to create directory: ${uploadsDir}`);
            
            // Ensure the directory exists
            await ensureDirectoryExists(uploadsDir);
            
            console.log(`Shop cover will be stored in: ${uploadsDir}`);
            
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
        // Use a consistent name for the cover image
        const fileName = `cover${path.extname(file.originalname).toLowerCase()}`;
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

const uploadShopCover = multer({
    storage: shopCoverStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024 // 5MB limit
    }
}).single('shopCover'); // IMPORTANT: This must match the field name from the frontend

const handleShopCoverUpload = async (req, res, next) => {
    console.log('Starting shop cover upload handler');
    console.log('Request content type:', req.headers['content-type']);
    console.log('Request headers:', req.headers);
    
    uploadShopCover(req, res, function (err) {
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
                error: 'Error uploading shop cover image',
                details: err.message
            });
        }
        
        console.log('Shop cover upload processed successfully');
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

export { handleShopCoverUpload };