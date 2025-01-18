import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { validateImageMiddleware, SUPPORTED_IMAGE_TYPES } from './imageValidationUtilities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration remains the same
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '..', '..', 'public', 'images', 'uploads', 'users');
        
        try {
            await fs.promises.mkdir(uploadsDir, { recursive: true });
            await fs.promises.chmod(uploadsDir, 0o755);
            
            if (req.body.name_user) {
                const userDir = path.join(uploadsDir, req.body.name_user);
                await fs.promises.mkdir(userDir, { recursive: true });
                await fs.promises.chmod(userDir, 0o755);
                cb(null, userDir);
            } else {
                cb(new Error('Usuario no especificado'));
            }
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'profile' + ext);
    }
});

// Updated multer configuration with basic MIME type check
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!Object.keys(SUPPORTED_IMAGE_TYPES).includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no soportado'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

// Enhanced upload middleware with deep validation
const uploadProfileImage = async (req, res, next) => {
    console.log('-> uploadMiddleware - uploadProfileImage() - Iniciando upload middleware');
    
    // Chain the middlewares
    upload.single('profileImage')(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                error: 'Error al subir el archivo',
                details: err.message
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                error: 'Error al subir el archivo de imagen',
                details: err.message
            });
        }

        // Continue to deep validation middleware
        validateImageMiddleware(req, res, next);
    });
};

export { uploadProfileImage };