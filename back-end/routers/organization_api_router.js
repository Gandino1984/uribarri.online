// back-end/routers/organization_api_router.js
import { Router } from "express";
import organizationApiController from "../controllers/organization/organization_api_controller.js";

const router = Router();

router.get("/", organizationApiController.getAll);
//update: New route to get unapproved organizations
router.get("/unapproved", organizationApiController.getUnapproved);

router.post("/by-id", organizationApiController.getById);
router.post("/by-user-id", organizationApiController.getByUserId);
router.post("/create", organizationApiController.create);

router.patch("/update", organizationApiController.update);

//update: New route to approve/reject organizations
router.patch("/approve", organizationApiController.approve);

router.delete("/remove-by-id/:id_organization", organizationApiController.removeById);

router.post("/upload-image", organizationApiController.uploadImage);

export default router;