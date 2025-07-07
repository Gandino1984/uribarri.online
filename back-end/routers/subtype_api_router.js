import { Router } from "express";
import subtypeApiController from "../controllers/subtype/subtype_api_controller.js";

const router = Router();

//update: Modified to get ALL subtypes (verified and unverified)
// Get all subtypes
router.get("/", subtypeApiController.getAll);

//update: New endpoint to get only verified subtypes
// Get verified subtypes
router.get("/verified", subtypeApiController.getVerified);

//update: New endpoint to get only unverified subtypes
// Get unverified subtypes
router.get("/unverified", subtypeApiController.getUnverified);

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