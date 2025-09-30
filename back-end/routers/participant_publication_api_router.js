// back-end/routers/participant_publication_api_router.js
import { Router } from "express";
import participantPublicationApiController from "../controllers/participant_publication/participant_publication_api_controller.js";

const router = Router();

//update: GET routes
router.get("/", participantPublicationApiController.getAll);

//update: POST routes
router.post("/by-participant", participantPublicationApiController.getByParticipantId);
router.post("/by-publication", participantPublicationApiController.getByPublicationId);
router.post("/by-organization", participantPublicationApiController.getByOrganizationId);
router.post("/create", participantPublicationApiController.create);
router.post("/remove-by-pair", participantPublicationApiController.removeByParticipantAndPublication);

//update: DELETE routes
router.delete("/remove-by-id/:id_participant_publication", participantPublicationApiController.removeById);

export default router;