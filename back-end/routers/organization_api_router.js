// back-end/routers/organization_api_router.js
import { Router } from "express";
import organizationApiController from "../controllers/organization/organization_api_controller.js";

const router = Router();

//update: GET routes
router.get("/", organizationApiController.getAll);

//update: POST routes
router.post("/by-id", organizationApiController.getById);
router.post("/by-user-id", organizationApiController.getByUserId);
router.post("/create", organizationApiController.create);

//update: PATCH routes
router.patch("/update", organizationApiController.update);

//update: DELETE routes
router.delete("/remove-by-id/:id_organization", organizationApiController.removeById);

//update: File upload routes
router.post("/upload-image", organizationApiController.uploadImage);

export default router;