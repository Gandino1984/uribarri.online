import { Router } from "express";

import userApiRouter from "./user_api_router.js";
import productApiRouter from "./product_api_router.js";
import shopApiRouter from "./shop_api_router.js";
import providerApiRouter from "./provider_api_router.js";

const router = Router();

// router.use("/register", userApiRouter);

// router.use("/login", userApiRouter);

router.use("/user", userApiRouter);

router.use("/product", productApiRouter);

router.use("/shop", shopApiRouter);

router.use("/provider", providerApiRouter);

export default router;