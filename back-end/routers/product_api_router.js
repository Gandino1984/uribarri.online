import { Router } from "express";

import productApiController from "../controllers/product/product_api_controller.js";

const router = Router();

router.get("/", productApiController.getAll);
router.get("/by-type", productApiController.getByType);

router.post("/create", productApiController.create);
router.post("/by-shop-id", productApiController.getByShopId);
router.post("/on-sale", productApiController.getOnSale);

export default router;