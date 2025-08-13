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

//update: Migrate shops from one subtype to another
router.post("/migrate-shops", subtypeApiController.migrateShops);

//update: Remove all subtypes by type ID (will fail if shops are using them)
router.delete("/remove-by-type/:id_type", subtypeApiController.removeByTypeId);

//update: Remove all subtypes by type ID with cascade (removes subtypes and all shops using them)
router.delete("/remove-by-type-cascade/:id_type", subtypeApiController.removeByTypeIdCascade);

//update: Get affected shops for a subtype (useful for checking before update/delete)
router.get("/:id_subtype/affected-shops", subtypeApiController.checkAffectedShops);

// Get subtype by ID
router.get("/:id_subtype", subtypeApiController.getById);

// Update subtype (will fail if shops are using it)
router.patch("/update/:id_subtype", subtypeApiController.update);

//update: Update subtype with cascade (updates subtype even if shops are using it)
router.patch("/update-cascade/:id_subtype", subtypeApiController.updateCascade);

// Remove subtype (will fail if shops are using it)
router.delete("/remove/:id_subtype", subtypeApiController.removeById);

//update: Remove subtype with cascade (removes subtype and all shops using it)
router.delete("/remove-cascade/:id_subtype", subtypeApiController.removeCascade);

export default router;