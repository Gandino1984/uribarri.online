// back-end/routers/publication_api_router.js
import { Router } from "express";
import publicationApiController from "../controllers/publication/publication_api_controller.js";

const router = Router();

//update: GET routes
router.get("/", publicationApiController.getAll);

//update: POST routes
router.post("/by-id", publicationApiController.getById);
router.post("/by-user-id", publicationApiController.getByUserId);
router.post("/by-date-range", publicationApiController.getByDateRange);
router.post("/by-organization", publicationApiController.getByOrganization);
router.post("/create", publicationApiController.create);

//update: PATCH routes
router.patch("/update", publicationApiController.update);
router.patch("/approve", publicationApiController.approvePublication);
//update: Add toggle-active route for manager control
router.patch("/toggle-active", publicationApiController.toggleActive);

//update: DELETE routes
router.delete("/remove-by-id/:id_publication", publicationApiController.removeById);

//update: POST route for image upload
router.post("/upload-image", publicationApiController.uploadImage);

export default router;