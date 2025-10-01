//update: back-end/middleware/PublicationUploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { validateImageMiddleware } from '../utils/imageValidationUtilities.js';
import { processUploadedImage } from '../utils/imageConversionUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//update: Helper function to ensure directory exists with proper permissions
const ensureDirectoryExists = async (dirPath) => {
  try {
    try {
      await fs.access(dirPath);
      console.log(`Directory already exists: ${dirPath}`);
    } catch {
      await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
      console.log(`Directory created successfully: ${dirPath}`);
    }
    
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

//update: Function to clean existing publication images before saving new ones
const cleanExistingPublicationImages = async (dirPath, publicationId) => {
  try {
    try {
      await fs.access(dirPath);
    } catch (err) {
      console.log('Directory does not exist yet, nothing to clean');
      return;
    }
    
    const files = await fs.readdir(dirPath);
    
    if (!files || files.length === 0) {
      console.log('No files to clean in directory');
      return;
    }
    
    const publicationFiles = files.filter(file => 
      file.includes(`publication_${publicationId}`) || 
      file.includes(`temp_publication_${publicationId}`)
    );
    
    if (publicationFiles.length === 0) {
      console.log('No existing publication files to clean');
      return;
    }
    
    console.log(`Cleaning ${publicationFiles.length} existing images for publication ${publicationId}`);
    
    for (const file of publicationFiles) {
      const filePath = path.join(dirPath, file);
      await fs.unlink(filePath);
      console.log(`Deleted existing publication image: ${filePath}`);
    }
  } catch (error) {
    console.error('Error cleaning existing publication images:', error);
  }
};

//update: Multer storage configuration for publication images
const publicationImageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log('=== Publication Image Upload - Setting Destination ===');
    console.log('Processing file:', file.fieldname, file.originalname);
    
    const publicationId = req.headers['x-publication-id'];
    
    console.log('Publication ID:', publicationId);

    if (!publicationId) {
      return cb(new Error('Publication ID is required'));
    }

    try {
      const projectRoot = path.resolve(__dirname, '..', '..');
      const uploadsDir = path.join(
        projectRoot,
        'public', 
        'images', 
        'uploads', 
        'publications'
      );

      console.log(`Target directory path: ${uploadsDir}`);
      
      const publicDir = path.join(projectRoot, 'public');
      const imagesDir = path.join(publicDir, 'images');
      const uploadsBaseDir = path.join(imagesDir, 'uploads');
      
      await ensureDirectoryExists(publicDir);
      await ensureDirectoryExists(imagesDir);
      await ensureDirectoryExists(uploadsBaseDir);
      await ensureDirectoryExists(uploadsDir);
      
      await cleanExistingPublicationImages(uploadsDir, publicationId);
      
      console.log(`Publication image will be stored in: ${uploadsDir}`);
      
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
    const publicationId = req.headers['x-publication-id'];
    const tempFileName = publicationId 
      ? `temp_publication_${publicationId}_${Date.now()}${path.extname(file.originalname)}`
      : `temp_publication_new_${Date.now()}${path.extname(file.originalname)}`;
    console.log(`Generated temporary filename: ${tempFileName}`);
    cb(null, tempFileName);
  }
});

//update: File filter for allowed image types
const fileFilter = (req, file, cb) => {
  console.log('File filter checking:', file.fieldname, file.mimetype);
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, PNG, JPG, and WebP are allowed. Received: ${file.mimetype}`), false);
  }
};

//update: Multer upload instance
const uploadPublicationImage = multer({
  storage: publicationImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for initial upload
  }
}).single('image'); // Field name must match frontend

//update: Main upload handler with validation and processing
const handlePublicationImageUpload = async (req, res, next) => {
  console.log('=== Starting Publication Image Upload Handler ===');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', {
    'x-publication-id': req.headers['x-publication-id']
  });
  
  uploadPublicationImage(req, res, async function (err) {
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
        error: 'Error uploading publication image',
        details: err.message
      });
    }
    
    console.log('Publication image upload processed by multer successfully');
    
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
      await validateImageMiddleware(req, res, async () => {
        try {
          console.log('Processing uploaded image for WebP conversion and compression...');
          
          const processedFile = await processUploadedImage(req.file);
          
          console.log('Image processed:', {
            original: req.file.filename,
            processed: processedFile.filename,
            size: Math.round(processedFile.size / 1024) + 'KB'
          });
          
          const publicationId = req.headers['x-publication-id'];
          if (publicationId) {
            const finalFilename = `publication_${publicationId}.webp`;
            const finalPath = path.join(path.dirname(processedFile.path), finalFilename);
            
            console.log(`Renaming ${processedFile.filename} to ${finalFilename}`);
            
            try {
              await fs.unlink(finalPath);
              console.log('Deleted existing file with same name');
            } catch (unlinkErr) {
              // File doesn't exist, which is fine
            }
            
            await fs.rename(processedFile.path, finalPath);
            console.log('✓ File renamed successfully');
            
            processedFile.path = finalPath;
            processedFile.filename = finalFilename;
          }
          
          req.file = processedFile;
          
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
      console.error('Image validation failed:', validationError);
    }
  });
};

export { handlePublicationImageUpload };