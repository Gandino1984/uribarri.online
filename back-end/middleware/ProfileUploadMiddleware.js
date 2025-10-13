//update: Changed to get userName from headers instead of req.body
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import user_model from '../models/user_model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    //update: Get userName from headers instead of req.body (multer timing issue)
    const userName = req.headers['x-user-name'];

    if (!userName) {
      console.error('Username not found in headers. Headers:', req.headers);
      return cb(new Error('Usuario no especificado'));
    }

    try {
      // Verify user exists
      const user = await user_model.findOne({ 
        where: { name_user: userName } 
      });
      
      if (!user) {
        console.error(`User not found: ${userName}`);
        return cb(new Error('Usuario no encontrado'));
      }
      
      console.log(`Processing profile image for user: ${userName}`);
      
      const uploadsDir = path.join(
        __dirname, 
        '..',
        'assets',
        'images', 
        'users', 
        userName
      );

      console.log(`Attempting to create directory: ${uploadsDir}`);
      
      await ensureDirectoryExists(uploadsDir);
      
      console.log(`Profile image will be stored in: ${uploadsDir}`);
      
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
    fileSize: 3 * 1024 * 1024 // 3MB limit
  }
}).single('profileImage');

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