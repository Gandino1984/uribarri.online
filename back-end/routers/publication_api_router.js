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
//update: Add missing by-organization route
router.post("/by-organization", publicationApiController.getByOrganization);
router.post("/create", publicationApiController.create);

router.patch("/update", publicationApiController.update);

router.delete("/remove-by-id/:id_publication", publicationApiController.removeById);

router.post("/upload-image", publicationApiController.uploadImage);

router.patch("/approve", publicationApiController.approvePublication);

export default router;