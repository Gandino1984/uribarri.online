import { Router } from "express";
import * as packageApiController from "../controllers/package/package_api_controller.js";

const router = Router();

// Get all packages
router.get("/", packageApiController.getAll);

// Create a new package
router.post("/create", packageApiController.create);

// Get packages by shop ID (all)
router.get("/by-shop-id/:id_shop", packageApiController.getByShopId);

// Get active packages by shop ID
router.get("/active-by-shop-id/:id_shop", packageApiController.getActiveByShopId);

// Get inactive packages by shop ID
router.get("/inactive-by-shop-id/:id_shop", packageApiController.getInactiveByShopId);

// Get package by ID
router.get("/by-id/:id_package", packageApiController.getById);

// Update a package
router.patch("/update", packageApiController.update);

// Toggle package active status
router.post("/toggle-active/:id_package", packageApiController.toggleActiveStatus);

// Delete a package
router.delete("/remove-by-id/:id_package", packageApiController.removeById);

export default router;