// back-end/routers/social_event_api_router.js
import { Router } from "express";
import socialEventApiController from "../controllers/social_event/social_event_api_controller.js";

const router = Router();

//update: GET routes
router.get("/", socialEventApiController.getAll);
router.get("/upcoming", socialEventApiController.getUpcoming);

//update: POST routes
router.post("/by-id", socialEventApiController.getById);
router.post("/by-user-id", socialEventApiController.getByUserId);
router.post("/by-date-range", socialEventApiController.getByDateRange);
router.post("/create", socialEventApiController.create);

//update: PATCH routes
router.patch("/update", socialEventApiController.update);

//update: DELETE routes
router.delete("/remove-by-id/:id_social_event", socialEventApiController.removeById);

//update: File upload routes
router.post("/upload-image", socialEventApiController.uploadImage);

export default router;