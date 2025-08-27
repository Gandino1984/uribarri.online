import { Router } from "express";
import categorySubcategoryApiController from "../controllers/category_subcategory/category_subcategory_api_controller.js";

const router = Router();

// Get all associations
router.get("/", categorySubcategoryApiController.getAll);

// Get all associations with category and subcategory details
router.get("/with-details", categorySubcategoryApiController.getWithDetails);

// Get associations by category ID
router.get("/category/:id_category", categorySubcategoryApiController.getByCategoryId);

// Get associations by subcategory ID
router.get("/subcategory/:id_subcategory", categorySubcategoryApiController.getBySubcategoryId);

// Check if an association exists between a category and subcategory
router.get("/check/:id_category/:id_subcategory", categorySubcategoryApiController.checkAssociation);

// Create new association
router.post("/create", categorySubcategoryApiController.create);

// Create multiple associations for a category
router.post("/create-multiple", categorySubcategoryApiController.createMultiple);

// Remove association by pair (category and subcategory IDs)
router.delete("/remove/:id_category/:id_subcategory", categorySubcategoryApiController.removeByPair);

// Remove all associations for a category
router.delete("/remove-by-category/:id_category", categorySubcategoryApiController.removeByCategoryId);

// Remove all associations for a subcategory
router.delete("/remove-by-subcategory/:id_subcategory", categorySubcategoryApiController.removeBySubcategoryId);

// Get association by ID
router.get("/:id_category_subcategory", categorySubcategoryApiController.getById);

// Remove association by ID
router.delete("/remove/:id_category_subcategory", categorySubcategoryApiController.removeById);

export default router;