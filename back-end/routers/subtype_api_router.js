import { Router } from "express";
import subtypeApiController from "../controllers/subtype/subtype_api_controller.js";

const router = Router();

// Get all subtypes
router.get("/", subtypeApiController.getAll);

// Get subtypes by type ID
router.get("/by-type/:id_type", subtypeApiController.getByTypeId);

// Get subtype by ID
router.get("/:id_subtype", subtypeApiController.getById);

// Create new subtype
router.post("/create", subtypeApiController.create);

// Update subtype
router.patch("/update/:id_subtype", subtypeApiController.update);

// Remove subtype
router.delete("/remove/:id_subtype", subtypeApiController.removeById);

export default router;