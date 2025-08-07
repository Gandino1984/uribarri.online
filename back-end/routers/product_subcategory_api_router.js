import { Router } from "express";
import productSubcategoryApiController from "../controllers/product_subcategory/product_subcategory_api_controller.js";

const router = Router();

// Get all subcategories
router.get("/", productSubcategoryApiController.getAll);

// Get verified subcategories
router.get("/verified", productSubcategoryApiController.getVerified);

// Get unverified subcategories
router.get("/unverified", productSubcategoryApiController.getUnverified);

// Get subcategories by category ID
router.get("/by-category/:id_category", productSubcategoryApiController.getByCategoryId);

//update: Get subcategories for a specific shop and category
router.get("/shop/:id_shop/category/:id_category", productSubcategoryApiController.getSubcategoriesForShopAndCategory);

// Create new subcategory
router.post("/create", productSubcategoryApiController.create);

// Remove all subcategories by category ID
router.delete("/remove-by-category/:id_category", productSubcategoryApiController.removeByCategoryId);

// Get subcategory by ID
router.get("/:id_subcategory", productSubcategoryApiController.getById);

// Update subcategory
router.patch("/update/:id_subcategory", productSubcategoryApiController.update);

// Remove subcategory
router.delete("/remove/:id_subcategory", productSubcategoryApiController.removeById);

export default router;