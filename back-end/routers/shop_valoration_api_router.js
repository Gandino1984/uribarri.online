import { Router } from "express";
import shopValorationApiController from "../controllers/shop_valoration/shop_valoration_api_controller.js";

const router = Router();

// Create a new valoration
router.post("/create", shopValorationApiController.create);

// Update an existing valoration
router.patch("/update", shopValorationApiController.update);

// Get a specific valoration by ID
router.get("/by-id/:id_valoration", shopValorationApiController.getById);

// Get all valorations for a shop
router.get("/by-shop/:id_shop", shopValorationApiController.getByShopId);

// Get all valorations by a user
router.get("/by-user/:id_user", shopValorationApiController.getByUserId);

// Get a specific valoration by user and shop
router.post("/by-user-and-shop", shopValorationApiController.getByUserAndShop);

//update: Check if user can rate a shop
router.post("/can-rate", shopValorationApiController.canUserRateShop);

// Delete a valoration
router.delete("/remove/:id_valoration", shopValorationApiController.removeById);

// Get average calification for a shop
router.get("/average/:id_shop", shopValorationApiController.getShopAverageCalification);

// Recalculate average calification for a shop (admin endpoint)
router.post("/recalculate-average/:id_shop", shopValorationApiController.recalculateShopAverageCalification);

export default router;