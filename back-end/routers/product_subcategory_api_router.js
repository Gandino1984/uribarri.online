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

// Get subcategories for a specific shop and category
router.get("/shop/:id_shop/category/:id_category", productSubcategoryApiController.getSubcategoriesForShopAndCategory);

// Create new subcategory
router.post("/create", productSubcategoryApiController.create);

//update: Migrate products from one subcategory to another
router.post("/migrate-products", productSubcategoryApiController.migrateProducts);

//update: Remove all subcategories by category ID (will fail if products are using them)
router.delete("/remove-by-category/:id_category", productSubcategoryApiController.removeByCategoryId);

//update: Remove all subcategories by category ID with cascade (removes associations and all products using them)
router.delete("/remove-by-category-cascade/:id_category", productSubcategoryApiController.removeByCategoryIdCascade);

//update: Get affected products for a subcategory (useful for checking before update/delete)
router.get("/:id_subcategory/affected-products", productSubcategoryApiController.checkAffectedProducts);

// Get subcategory by ID
router.get("/:id_subcategory", productSubcategoryApiController.getById);

// Update subcategory (will fail if products are using it)
router.patch("/update/:id_subcategory", productSubcategoryApiController.update);

//update: Update subcategory with cascade (updates subcategory even if products are using it)
router.patch("/update-cascade/:id_subcategory", productSubcategoryApiController.updateCascade);

// Remove subcategory (will fail if products are using it)
router.delete("/remove/:id_subcategory", productSubcategoryApiController.removeById);

//update: Remove subcategory with cascade (removes subcategory and all products using it)
router.delete("/remove-cascade/:id_subcategory", productSubcategoryApiController.removeCascade);

export default router;