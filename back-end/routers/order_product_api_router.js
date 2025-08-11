import { Router } from "express";
import orderProductApiController from "../controllers/order_product/order_product_api_controller.js";

const router = Router();

router.get("/", orderProductApiController.getAll);

router.post("/by-id", orderProductApiController.getById);

router.post("/create", orderProductApiController.create);

router.patch("/update/:id_order_product", orderProductApiController.update);

router.delete("/remove-by-id/:id_order_product", orderProductApiController.removeById);

export default router;