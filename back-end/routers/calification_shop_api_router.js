import { Router } from "express";
import calificationShopApiController from "../controllers/calification_shop/calification_shop_api_controller.js";

const router = Router();

// Create a new shop calification
router.post("/create", calificationShopApiController.create);

// Update an existing shop calification
router.patch("/update", calificationShopApiController.update);

// Delete a shop calification by id
router.delete("/remove/:id_calification", calificationShopApiController.removeById);

// Get all califications for a shop
router.get("/by-shop/:id_shop", calificationShopApiController.getByShopId);

// Get all shop califications by a user
router.get("/by-user/:id_user", calificationShopApiController.getByUserId);

// Get calification by user and shop
router.get("/by-user-shop/:id_user/:id_shop", calificationShopApiController.getByUserAndShop);

// Get calification statistics for a shop
router.get("/stats/:id_shop", calificationShopApiController.getShopCalificationStats);

export default router;