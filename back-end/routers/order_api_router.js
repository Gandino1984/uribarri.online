import { Router } from "express";
import orderApiController from "../controllers/order/order_api_controller.js";

const router = Router();

router.get("/", orderApiController.getAll);

router.post("/by-id", orderApiController.getById);

router.post("/by-user-id", orderApiController.getByUserId);

router.post("/by-shop-id", orderApiController.getByShopId);

//update: Add route to get orders by rider
router.post("/by-rider-id", orderApiController.getByRiderId);

router.post("/create", orderApiController.create);

router.patch("/update-status/:id_order", orderApiController.updateStatus);

router.patch("/cancel/:id_order", orderApiController.cancel);

//update: Add routes for rider management
router.patch("/assign-rider/:id_order", orderApiController.assignRider);

router.patch("/rider-response/:id_order", orderApiController.riderResponse);

export default router;