import { Router } from "express";
import productApiController from "../controllers/product/product_api_controller.js";
import { handleProductImageUpload } from '../middleware/uploadMiddleware.js';
import path from 'path';

const router = Router();

router.get("/", productApiController.getAll);

router.get("/by-shop-id/:id_shop", productApiController.getByShopId);

router.get("/by-type/:type_product", productApiController.getByType);

router.get("/on-sale", productApiController.getOnSale);

router.get("/by-id/:id_product", productApiController.getById);

router.get("/by-country/:country_product", productApiController.getByCountry);

router.get("/by-locality/:locality_product", productApiController.getByLocality);

router.post("/create", productApiController.create);

router.post('/upload-product-image', handleProductImageUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file provided' 
      });
    }

    // Construct the path relative to the public directory
    const relativePath = path.join('images', 'uploads', 'shops', req.headers['x-shop-name'], 'product_images', path.basename(req.file.path))
      .split(path.sep)
      .join('/');
    
    // Update the product's image path in the database
    const result = await productApiController.updateProductImage(req.headers['x-product-id'], relativePath);
    
    if (result.error) {
      return res.status(400).json(result);
    }

    return res.json({
      ...result,
      data: {
        ...result.data,
        image_product: relativePath // Return the clean relative path
      }
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return res.status(500).json({ 
      error: 'Error en la carga de la imagen del producto',
      details: error.message 
    });
  }
});

router.patch("/update", productApiController.update);

router.delete("/remove-by-id/:id_product", productApiController.removeById);

router.delete('/delete-image/:id_product', productApiController.deleteImage);

router.post("/verify-product-name", productApiController.verifyProductName);

export default router;