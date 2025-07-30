import { Router } from "express";
import orderApiController from "../controllers/order/order_api_controller.js";

const router = Router();

router.get("/", orderApiController.getAll);

router.post("/by-id", orderApiController.getById);

router.post("/by-user-id", orderApiController.getByUserId);

router.post("/by-shop-id", orderApiController.getByShopId);

router.post("/create", orderApiController.create);

router.patch("/update-status/:id_order", orderApiController.updateStatus);

router.patch("/cancel/:id_order", orderApiController.cancel);

export default router;