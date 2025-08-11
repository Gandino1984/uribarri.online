// back-end/routers/package_api_router.js
import express from 'express';
import * as packageApiController from '../controllers/package/package_api_controller.js';
import { handlePackageImageUpload } from '../middleware/PackageUploadMiddleware.js';
//update: Import necessary modules for image handling
import shop_model from '../models/shop_model.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Basic CRUD operations
router.get('/all', packageApiController.getAll);
router.get('/by-id/:id_package', packageApiController.getById);
router.post('/create', packageApiController.create);
router.patch('/update', packageApiController.update);
router.delete('/remove/:id_package', packageApiController.removeById);

// Shop-specific operations
router.get('/by-shop-id/:id_shop', packageApiController.getByShopId);
router.get('/active-by-shop-id/:id_shop', packageApiController.getActiveByShopId);
router.get('/inactive-by-shop-id/:id_shop', packageApiController.getInactiveByShopId);

//update: Status operations - Fixed route path
router.patch('/toggle-status/:id_package', packageApiController.toggleActiveStatus);

// Image upload operations with enhanced processing
//update: Use the middleware and then handle the response
router.post('/upload-image', handlePackageImageUpload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        const packageId = req.headers['x-package-id'];
        const shopId = req.headers['x-shop-id'];
        
        if (!shopId) {
            return res.status(400).json({
                error: 'Shop ID is required'
            });
        }
        
        // Get the shop to construct the proper relative path
        const shop = await shop_model.findByPk(shopId);
        
        if (!shop) {
            return res.status(404).json({
                error: 'Shop not found'
            });
        }

        // Construct the relative path for storing in the database
        const relativePath = path.join(
            'images', 
            'uploads', 
            'shops', 
            shop.name_shop, 
            'package_images', 
            req.file.filename
        ).replace(/\\/g, '/'); // Convert Windows-style paths to URL-style paths

        console.log(`Saving package image path to database: ${relativePath}`);

        // If we have a package ID, update the package's image_package field in the database
        if (packageId) {
            const packageController = await import('../controllers/package/package_controller.js');
            const result = await packageController.default.updatePackageImage(packageId, relativePath);

            if (result.error) {
                // Clean up the uploaded file if database update fails
                const filePath = path.join(__dirname, '..', '..', 'public', relativePath);
                try {
                    await fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error('Error deleting uploaded file:', unlinkError);
                }
                
                return res.status(500).json({
                    error: 'Failed to update package with new image',
                    details: result.error
                });
            }

            console.log('Package updated successfully with new image');
        }

        // Return the image path
        res.json({
            error: null,
            data: {
                image_package: relativePath,
                id_package: packageId || null,
                filename: req.file.filename
            },
            success: "Imagen del paquete subida con éxito"
        });

    } catch (err) {
        console.error('Error in package image upload route:', err);
        res.status(500).json({
            error: 'Error processing package image upload',
            details: err.message
        });
    }
});

// Rename image endpoint for new packages
router.post('/rename-image', packageApiController.renamePackageImage);

export default router;