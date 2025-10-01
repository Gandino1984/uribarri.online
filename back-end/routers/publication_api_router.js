//update: back-end/routers/publication_api_router.js
import { Router } from "express";
import publicationApiController from "../controllers/publication/publication_api_controller.js";
import { handlePublicationImageUpload } from "../middleware/PublicationUploadMiddleware.js";

const router = Router();

// GET routes
router.get("/", publicationApiController.getAll);

// POST routes
router.post("/by-id", publicationApiController.getById);
router.post("/by-user-id", publicationApiController.getByUserId);
router.post("/by-date-range", publicationApiController.getByDateRange);
router.post("/by-organization", publicationApiController.getByOrganization);
router.post("/create", publicationApiController.create);

// PATCH routes
router.patch("/update", publicationApiController.update);
router.patch("/approve", publicationApiController.approvePublication);
router.patch("/toggle-active", publicationApiController.toggleActive);

// DELETE routes
router.delete("/remove-by-id/:id_publication", publicationApiController.removeById);

// POST route for image upload with middleware
router.post(
  "/upload-image", 
  handlePublicationImageUpload, 
  publicationApiController.uploadImage
);

export default router;