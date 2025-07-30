import { Router } from "express";
import orderPackageApiController from "../controllers/order_package/order_package_api_controller.js";

const router = Router();

router.get("/", orderPackageApiController.getAll);

router.post("/by-id", orderPackageApiController.getById);

router.post("/create", orderPackageApiController.create);

router.patch("/update/:id_order_package", orderPackageApiController.update);

router.delete("/remove-by-id/:id_order_package", orderPackageApiController.removeById);

export default router;