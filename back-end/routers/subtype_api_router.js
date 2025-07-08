import { Router } from "express";
import subtypeApiController from "../controllers/subtype/subtype_api_controller.js";

const router = Router();

// Get all subtypes
router.get("/", subtypeApiController.getAll);

// Get verified subtypes
router.get("/verified", subtypeApiController.getVerified);

// Get unverified subtypes
router.get("/unverified", subtypeApiController.getUnverified);

// Get subtypes by type ID
router.get("/by-type/:id_type", subtypeApiController.getByTypeId);

// Create new subtype
router.post("/create", subtypeApiController.create);

// Remove all subtypes by type ID
router.delete("/remove-by-type/:id_type", subtypeApiController.removeByTypeId);

// Get subtype by ID
router.get("/:id_subtype", subtypeApiController.getById);

// Update subtype
router.patch("/update/:id_subtype", subtypeApiController.update);

// Remove subtype
router.delete("/remove/:id_subtype", subtypeApiController.removeById);

export default router;