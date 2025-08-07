import { Router } from "express";
import typeCategoryApiController from "../controllers/type_category/type_category_api_controller.js";

const router = Router();

// Get all type-category associations
router.get("/", typeCategoryApiController.getAll);

// Get all categories for a type
router.get("/type/:id_type/categories", typeCategoryApiController.getCategoriesByType);

// Get all types for a category
router.get("/category/:id_category/types", typeCategoryApiController.getTypesByCategory);

// Create new association
router.post("/create", typeCategoryApiController.create);

// Remove by association ID
router.delete("/remove/:id_type_category", typeCategoryApiController.removeById);

// Remove all associations for a type
router.delete("/remove-by-type/:id_type", typeCategoryApiController.removeByType);

// Remove all associations for a category
router.delete("/remove-by-category/:id_category", typeCategoryApiController.removeByCategory);

export default router;