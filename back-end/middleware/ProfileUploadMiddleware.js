import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import user_model from '../models/user_model.js';

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

const profileImageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log('Multer processing profile image:', file.fieldname, file.originalname);
    
    const userName = req.body.name_user;

    if (!userName) {
      return cb(new Error('Usuario no especificado'));
    }

    try {
      // Verify user exists
      const user = await user_model.findOne({ 
        where: { name_user: userName } 
      });
      
      if (!user) {
        return cb(new Error('Usuario no encontrado'));
      }
      
      console.log(`Processing profile image for user: ${userName}`);
      
      // Create path for user-specific profile images - use forward slashes for Docker compatibility
      const uploadsDir = path.join(
        __dirname, 
        '..',
        '..',
        'public', 
        'images', 
        'uploads', 
        'users', 
        userName
      );

      console.log(`Attempting to create directory: ${uploadsDir}`);
      
      // Ensure the directory exists
      await ensureDirectoryExists(uploadsDir);
      
      console.log(`Profile image will be stored in: ${uploadsDir}`);
      
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
    // Use a consistent naming pattern for profile images
    const fileName = `profile${path.extname(file.originalname).toLowerCase()}`;
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
    cb(new Error(`Tipo de archivo inválido. Solo se permiten JPEG, PNG, JPG y WebP. Recibido: ${file.mimetype}`), false);
  }
};

const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB limit (igual que los otros middleware)
  }
}).single('profileImage'); // IMPORTANT: This must match the field name from the frontend

const handleProfileImageUpload = async (req, res, next) => {
  console.log('Starting profile image upload handler');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', req.headers);
  
  uploadProfileImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        error: 'Error al subir el archivo',
        details: err.message,
        code: err.code,
        field: err.field
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: 'Error al subir la imagen de perfil',
        details: err.message
      });
    }
    
    console.log('Profile image upload processed successfully');
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

export { handleProfileImageUpload };