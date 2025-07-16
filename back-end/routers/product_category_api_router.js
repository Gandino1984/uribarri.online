import { Router } from "express";
import productCategoryApiController from "../controllers/product_category/product_category_api_controller.js";

const router = Router();

// Get all categories
router.get("/", productCategoryApiController.getAll);

// Get verified categories
router.get("/verified", productCategoryApiController.getVerified);

// Get unverified categories
router.get("/unverified", productCategoryApiController.getUnverified);

// Get categories with their subcategories
router.get("/with-subcategories", productCategoryApiController.getWithSubcategories);

//update: Get categories available for a specific shop
router.get("/shop/:id_shop", productCategoryApiController.getCategoriesForShop);

// Create new category
router.post("/create", productCategoryApiController.create);

// Get category by ID
router.get("/:id_category", productCategoryApiController.getById);

// Update category
router.patch("/update/:id_category", productCategoryApiController.update);

// Remove category
router.delete("/remove/:id_category", productCategoryApiController.removeById);

export default router;