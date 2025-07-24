import { Router } from "express";

import userApiRouter from "./user_api_router.js";
import productApiRouter from "./product_api_router.js";
import shopApiRouter from "./shop_api_router.js";
import providerApiRouter from "./provider_api_router.js";
import packageApiRouter from "./package_api_router.js"; 
import typeApiRouter from "./type_api_router.js";
import subtypeApiRouter from "./subtype_api_router.js";
import productCategoryApiRouter from "./product_category_api_router.js";
import productSubcategoryApiRouter from "./product_subcategory_api_router.js";
import typeCategoryApiRouter from "./type_category_api_router.js";
import calificationApiRouter from "./calification_api_router.js";
import calificationShopApiRouter from "./calification_shop_api_router.js";

const router = Router();

router.use("/user", userApiRouter);

router.use("/product", productApiRouter);

router.use("/shop", shopApiRouter);

router.use("/provider", providerApiRouter);

router.use("/package", packageApiRouter); 

router.use("/type", typeApiRouter);

router.use("/subtype", subtypeApiRouter);

router.use("/product-category", productCategoryApiRouter);

router.use("/product-subcategory", productSubcategoryApiRouter);

router.use("/type-category", typeCategoryApiRouter);

router.use("/calification", calificationApiRouter);

router.use("/calification-shop", calificationShopApiRouter);

export default router;