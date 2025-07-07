import { Router } from "express";

import userApiRouter from "./user_api_router.js";
import productApiRouter from "./product_api_router.js";
import shopApiRouter from "./shop_api_router.js";
import providerApiRouter from "./provider_api_router.js";
import packageApiRouter from "./package_api_router.js"; 
//update: Added type and subtype routers
import typeApiRouter from "./type_api_router.js";
import subtypeApiRouter from "./subtype_api_router.js";

const router = Router();

router.use("/user", userApiRouter);

router.use("/product", productApiRouter);

router.use("/shop", shopApiRouter);

router.use("/provider", providerApiRouter);

router.use("/package", packageApiRouter); 

router.use("/type", typeApiRouter);

router.use("/subtype", subtypeApiRouter);

export default router;