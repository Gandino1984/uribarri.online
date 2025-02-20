import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to ensure directory exists with proper permissions
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
    }
};

const shopCoverStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const id_shop = req.headers['x-shop-id'];

        if (!id_shop) {
            return cb(new Error('Shop ID is required'));
        }

        const uploadsDir = path.join(__dirname, '..', '..', 'public', 'images', 'uploads', 'shops', 'covers');

        try {
            await ensureDirectoryExists(uploadsDir);
            cb(null, uploadsDir);
        } catch (error) {
            console.error('Error setting up upload directory:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const id_shop = req.headers['x-shop-id'];
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileName = `shop_${id_shop}_${Date.now()}${fileExt}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed.'), false);
    }
};

const uploadShopCover = multer({
    storage: shopCoverStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const handleShopCoverUpload = async (req, res, next) => {
    uploadShopCover.single('shopCover')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                error: 'Error uploading file',
                details: err.message
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                error: 'Error uploading shop cover image',
                details: err.message
            });
        }
        next();
    });
};

export { handleShopCoverUpload };