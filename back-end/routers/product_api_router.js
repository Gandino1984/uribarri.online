import { Router } from "express";
import productApiController from "../controllers/product/product_api_controller.js";
import productController from '../controllers/product/product_controller.js';
import { handleProductImageUpload } from '../middleware/ProductUploadMiddleware.js';
// import path from 'path';

const router = Router();

router.get("/", productApiController.getAll);

// UPDATE: Added route to get active products from a shop
router.get("/active-by-shop-id/:id_shop", productApiController.getActiveByShopId);

// UPDATE: Added route to get inactive products from a shop
router.get("/inactive-by-shop-id/:id_shop", productApiController.getInactiveByShopId);

// Original route to get all products (active and inactive) from a shop
router.get("/by-shop-id/:id_shop", productApiController.getByShopId);

router.get("/by-type/:type_product", productApiController.getByType);

router.get("/on-sale", productApiController.getOnSale);

router.get("/by-id/:id_product", productApiController.getById);

router.get("/by-country/:country_product", productApiController.getByCountry);

router.get("/by-locality/:locality_product", productApiController.getByLocality);

// UPDATE: Added route to toggle product active status
router.post("/toggle-active", productApiController.toggleActiveStatus);

router.post("/create", productApiController.create);

router.post('/upload-image', handleProductImageUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const productId = req.headers['x-product-id'];
    
    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }

    // Construct the relative path for storing in the database
    // IMPORTANT: We're ensuring this path is relative to the public directory
    // and doesn't include 'public/' in the path itself
    const relativePath = req.file.path
      .split('public')[1]
      .replace(/\\/g, '/'); // Convert Windows-style paths to URL-style paths

    console.log(`Saving product image path to database: ${relativePath}`);

    // Update the product's image_product field in the database using the controller
    const result = await productController.updateProductImage(productId, relativePath);

    if (result.error) {
      return res.status(500).json({
        error: 'Failed to update product with new image',
        details: result.error
      });
    }

    console.log('Product updated successfully with new image');

    // Return the updated image path
    res.json({
      error: null,
      data: {
        image_product: relativePath
      }
    });

  } catch (err) {
    console.error('Error in product image upload route:', err);
    res.status(500).json({
      error: 'Error processing product image upload',
      details: err.message
    });
  }
});

router.patch("/update", productApiController.update);

router.delete("/remove-by-id/:id_product", productApiController.removeById);

router.delete('/delete-image/:id_product', productApiController.deleteImage);

router.post("/verify-product-name", productApiController.verifyProductName);

export default router;