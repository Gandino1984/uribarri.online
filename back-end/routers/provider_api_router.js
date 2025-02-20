import { Router } from "express";

import providerApiController from "../controllers/provider/provider_api_controller.js";

const router = Router();

router.get("/", providerApiController.getAll);
router.get("/create", providerApiController.create);
// router.post("/", providerApiController.create);
router.get("/:id", providerApiController.getById);
// router.put("/", providerApiController.update);
router.get("/:id/update", providerApiController.update);
// router.delete("/:id", providerApiController.removeById);
router.get("/:id/remove", providerApiController.removeById);

export default router;