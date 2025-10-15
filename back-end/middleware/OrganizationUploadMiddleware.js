//update: back-end/middleware/OrganizationUploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import organization_model from '../models/organization_model.js';
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

//update: Function to clean existing organization images before saving new ones
const cleanExistingOrganizationImages = async (dirPath, organizationId) => {
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
    
    const orgFiles = files.filter(file => 
      file.includes(`organization_${organizationId}`) || 
      file.includes(`temp_organization_${organizationId}`)
    );
    
    if (orgFiles.length === 0) {
      console.log('No existing organization files to clean');
      return;
    }
    
    console.log(`Cleaning ${orgFiles.length} existing images for organization ${organizationId}`);
    
    for (const file of orgFiles) {
      const filePath = path.join(dirPath, file);
      await fs.unlink(filePath);
      console.log(`Deleted existing organization image: ${filePath}`);
    }
  } catch (error) {
    console.error('Error cleaning existing organization images:', error);
  }
};

//update: Multer storage configuration for organization images - now stores in back-end/assets/images
const organizationImageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log('=== Organization Image Upload - Setting Destination ===');
    console.log('Processing file:', file.fieldname, file.originalname);
    
    const organizationId = req.headers['x-organization-id'];
    
    console.log('Organization ID:', organizationId);

    if (!organizationId) {
      return cb(new Error('Organization ID is required'));
    }

    try {
      const organization = await organization_model.findByPk(organizationId);
      
      if (!organization) {
        return cb(new Error('Organization not found'));
      }
      
      const organizationName = organization.name_org;
      console.log(`Found organization: ${organizationName} (ID: ${organizationId})`);
      
      //update: Changed to back-end/assets/images path structure (matching other images)
      const uploadsDir = path.join(
        __dirname, 
        '..',
        'assets', 
        'images', 
        'organizations',
        organizationName
      );

      console.log(`Target directory path: ${uploadsDir}`);
      
      //update: Create directory structure step by step
      const assetsDir = path.join(__dirname, '..', 'assets');
      const imagesDir = path.join(assetsDir, 'images');
      const organizationsDir = path.join(imagesDir, 'organizations');
      
      await ensureDirectoryExists(assetsDir);
      await ensureDirectoryExists(imagesDir);
      await ensureDirectoryExists(organizationsDir);
      await ensureDirectoryExists(uploadsDir);
      
      await cleanExistingOrganizationImages(uploadsDir, organizationId);
      
      console.log(`Organization image will be stored in: ${uploadsDir}`);
      
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
    const organizationId = req.headers['x-organization-id'];
    const tempFileName = organizationId 
      ? `temp_organization_${organizationId}_${Date.now()}${path.extname(file.originalname)}`
      : `temp_organization_new_${Date.now()}${path.extname(file.originalname)}`;
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
const uploadOrganizationImage = multer({
  storage: organizationImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for initial upload
  }
}).single('image'); // Field name must match frontend

//update: Main upload handler with validation and processing
const handleOrganizationImageUpload = async (req, res, next) => {
  console.log('=== Starting Organization Image Upload Handler ===');
  console.log('Request content type:', req.headers['content-type']);
  console.log('Request headers:', {
    'x-organization-id': req.headers['x-organization-id']
  });
  
  uploadOrganizationImage(req, res, async function (err) {
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
        error: 'Error uploading organization image',
        details: err.message
      });
    }
    
    console.log('Organization image upload processed by multer successfully');
    
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
          
          const organizationId = req.headers['x-organization-id'];
          if (organizationId) {
            const finalFilename = `organization_${organizationId}.webp`;
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

export { handleOrganizationImageUpload };