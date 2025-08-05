import express from 'express';
import * as packageApiController from '../controllers/package/package_api_controller.js';
import { handlePackageImageUpload } from '../middleware/PackageUploadMiddleware.js';

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

// Status operations
router.patch('/toggle-status/:id_package', packageApiController.toggleActiveStatus);

// Image upload
router.post('/upload-image', handlePackageImageUpload, packageApiController.uploadPackageImage);

export default router;