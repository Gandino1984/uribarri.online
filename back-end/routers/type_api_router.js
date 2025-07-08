import { Router } from "express";
import typeApiController from "../controllers/type/type_api_controller.js";

const router = Router();

// Get all types
router.get("/", typeApiController.getAll);


// Get verified types
router.get("/verified", typeApiController.getVerified);

// Get unverified types
router.get("/unverified", typeApiController.getUnverified);

// Get all types with their subtypes
router.get("/with-subtypes", typeApiController.getAllWithSubtypes);

// Get subtypes by type ID
router.get("/:id_type/subtypes", typeApiController.getSubtypesByTypeId);

// Get type by ID
router.get("/:id_type", typeApiController.getById);

// Create new type
router.post("/create", typeApiController.create);

// Update type
router.patch("/update/:id_type", typeApiController.update);

// Remove type
router.delete("/remove/:id_type", typeApiController.removeById);

export default router;