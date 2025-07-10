import { Router } from "express";
import productCategoryApiController from "../controllers/product_category/product_category_api_controller.js";

const router = Router();

// Get all categories
router.get("/", productCategoryApiController.getAll);

// Get verified categories
router.get("/verified", productCategoryApiController.getVerified);

// Get unverified categories
router.get("/unverified", productCategoryApiController.getUnverified);

// Get all categories with their subcategories
router.get("/with-subcategories", productCategoryApiController.getAllWithSubcategories);

// Get subcategories by category ID
router.get("/:id_category/subcategories", productCategoryApiController.getSubcategoriesByCategoryId);

// Get category by ID
router.get("/:id_category", productCategoryApiController.getById);

// Create new category
router.post("/create", productCategoryApiController.create);

// Update category
router.patch("/update/:id_category", productCategoryApiController.update);

// Remove category
router.delete("/remove/:id_category", productCategoryApiController.removeById);

export default router;