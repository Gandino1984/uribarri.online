// back-end/routers/organization_api_router.js
import { Router } from "express";
import organizationApiController from "../controllers/organization/organization_api_controller.js";
//update: Import organization upload middleware
import { handleOrganizationImageUpload } from "../middleware/OrganizationUploadMiddleware.js";

const router = Router();

router.get("/", organizationApiController.getAll);
router.get("/unapproved", organizationApiController.getUnapproved);

router.post("/by-id", organizationApiController.getById);
router.post("/by-user-id", organizationApiController.getByUserId);
router.post("/create", organizationApiController.create);

router.patch("/update", organizationApiController.update);
router.patch("/approve", organizationApiController.approve);

router.delete("/remove-by-id/:id_organization", organizationApiController.removeById);

//update: Use organization upload middleware for image upload
router.post("/upload-image", handleOrganizationImageUpload, organizationApiController.uploadImage);

export default router;