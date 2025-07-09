// imageValidationUtilities.js
import { validateMIMEType } from "validate-image-type";
import fs from 'fs/promises';

// Configuration for supported image types
export const SUPPORTED_IMAGE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
};

export const IMAGE_VALIDATION_CONFIG = {
    allowMimeTypes: Object.keys(SUPPORTED_IMAGE_TYPES),
    maxSize: 1 * 1024 * 1024 // 1MB in bytes (updated from 2MB)
};

// Utility function to deeply validate an image file
export const validateImage = async (filePath) => {
    try {
        const result = await validateMIMEType(filePath, {
            allowMimeTypes: IMAGE_VALIDATION_CONFIG.allowMimeTypes
        });

        if (!result.ok) {
            throw new Error(result.error);
        }

        // Get file size
        const stats = await fs.stat(filePath);
        
        //update: We don't reject based on size anymore since we'll compress it
        // Just log a warning if it's over 1MB
        if (stats.size > IMAGE_VALIDATION_CONFIG.maxSize) {
            console.log(`Image size is ${Math.round(stats.size / (1024 * 1024))}MB, will be compressed to 1MB`);
        }

        return {
            valid: true,
            mimeType: result.mimeType,
            size: stats.size,
            needsCompression: stats.size > IMAGE_VALIDATION_CONFIG.maxSize
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
};

// Enhanced middleware for image validation
export const validateImageMiddleware = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No se ha proporcionado ningún archivo'
            });
        }

        const validationResult = await validateImage(req.file.path);

        if (!validationResult.valid) {
            // Clean up the invalid file
            await fs.unlink(req.file.path);
            
            return res.status(400).json({
                error: 'Archivo de imagen inválido',
                details: validationResult.error
            });
        }

        //update: Log if compression will be needed
        if (validationResult.needsCompression) {
            console.log('Image needs compression, will be processed');
        }

        // Attach validation result to request for potential later use
        req.imageValidation = validationResult;
        next();
    } catch (error) {
        console.error('-> imageValidationUtilities.js - validateImageMiddleware() - Error en la validación de la imagen = ', error);
        
        // Cleanup on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error('-> imageValidationUtilities.js - validateImageMiddleware() - Error al limpiar el archivo = ', cleanupError);
            }
        }

        return res.status(500).json({
            error: 'Error al validar la imagen',
        });
    }
};