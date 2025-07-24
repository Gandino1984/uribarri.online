import { Router } from "express";
import calificationApiController from "../controllers/calification_product/calification_api_controller.js";

const router = Router();

// Create a new calification
router.post("/create", calificationApiController.create);

// Update an existing calification
router.patch("/update", calificationApiController.update);

// Delete a calification by id
router.delete("/remove/:id_calification", calificationApiController.removeById);

// Get all califications for a product
router.get("/by-product/:id_product", calificationApiController.getByProductId);

// Get all califications by a user
router.get("/by-user/:id_user", calificationApiController.getByUserId);

// Get calification by user and product
router.get("/by-user-product/:id_user/:id_product", calificationApiController.getByUserAndProduct);

// Get calification statistics for a product
router.get("/stats/:id_product", calificationApiController.getProductCalificationStats);

export default router;