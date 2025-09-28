// back-end/routers/participant_request_api_router.js
import { Router } from "express";
import participantRequestApiController from "../controllers/participant_request/participant_request_api_controller.js";

const router = Router();

//update: POST routes
router.post("/create", participantRequestApiController.createRequest);
router.post("/by-organization", participantRequestApiController.getOrganizationRequests);
router.post("/by-user", participantRequestApiController.getUserRequests);
router.post("/approve", participantRequestApiController.approveRequest);
router.post("/reject", participantRequestApiController.rejectRequest);
router.post("/cancel", participantRequestApiController.cancelRequest);

export default router;