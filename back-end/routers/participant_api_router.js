// back-end/routers/participant_api_router.js
import { Router } from "express";
import participantApiController from "../controllers/participant/participant_api_controller.js";

const router = Router();

//update: GET routes
router.get("/", participantApiController.getAll);

//update: POST routes
router.post("/by-organization", participantApiController.getByOrganizationId);
router.post("/by-user", participantApiController.getByUserId);
router.post("/create", participantApiController.create);
router.post("/remove-by-user-org", participantApiController.removeByUserAndOrg);

//update: DELETE routes
router.delete("/remove-by-id/:id_participant", participantApiController.removeById);

export default router;