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

//update: Get affected shops for a type (useful for checking before update/delete)
router.get("/:id_type/affected-shops", typeApiController.checkAffectedShops);

// Get subtypes by type ID
router.get("/:id_type/subtypes", typeApiController.getSubtypesByTypeId);

// Get type by ID
router.get("/:id_type", typeApiController.getById);

// Create new type
router.post("/create", typeApiController.create);

// Update type (will fail if shops are using it)
router.patch("/update/:id_type", typeApiController.update);

//update: Update type with cascade (updates type even if shops are using it)
router.patch("/update-cascade/:id_type", typeApiController.updateCascade);

// Remove type (will fail if shops are using it)
router.delete("/remove/:id_type", typeApiController.removeById);

//update: Remove type with cascade (removes type and all shops using it)
router.delete("/remove-cascade/:id_type", typeApiController.removeCascade);

export default router;