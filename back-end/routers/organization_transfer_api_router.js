// back-end/routers/organization_transfer_api_router.js
import { Router } from "express";
import organizationTransferApiController from "../controllers/organization_transfer_request/organization_transfer_api_controller.js";

const router = Router();

//update: GET all transfer requests
router.get("/", organizationTransferApiController.getAll);

//update: POST routes for querying transfer requests
router.post("/by-organization", organizationTransferApiController.getByOrganizationId);
router.post("/by-from-user", organizationTransferApiController.getByFromUserId);
router.post("/by-to-user", organizationTransferApiController.getByToUserId);

//update: POST route to create a transfer request
router.post("/create", organizationTransferApiController.create);

//update: POST routes for transfer actions
router.post("/accept", organizationTransferApiController.acceptTransfer);
router.post("/reject", organizationTransferApiController.rejectTransfer);
router.post("/cancel", organizationTransferApiController.cancelTransfer);

export default router;