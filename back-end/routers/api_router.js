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
import categorySubcategoryApiRouter from "./category_subcategory_api_router.js";
import typeCategoryApiRouter from "./type_category_api_router.js";
import calificationApiRouter from "./calification_api_router.js";
import calificationShopApiRouter from "./calification_shop_api_router.js";
import orderApiRouter from "./order_api_router.js";
import orderProductApiRouter from "./order_product_api_router.js";
import orderPackageApiRouter from "./order_package_api_router.js";
import shopValorationApiRouter from "./shop_valoration_api_router.js";

import organizationApiRouter from "./organization_api_router.js";
import participantApiRouter from "./participant_api_router.js";
import publicationApiRouter from "./publication_api_router.js";
import socialEventApiRouter from "./social_event_api_router.js";


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

router.use("/category-subcategory", categorySubcategoryApiRouter);

router.use("/type-category", typeCategoryApiRouter);

router.use("/calification", calificationApiRouter);

router.use("/calification-shop", calificationShopApiRouter);

router.use("/order", orderApiRouter);

router.use("/order-product", orderProductApiRouter);

router.use("/order-package", orderPackageApiRouter);

router.use("/shop-valoration", shopValorationApiRouter);

router.use("/organization", organizationApiRouter);

router.use("/participant", participantApiRouter);

router.use("/publication", publicationApiRouter);

router.use("/social-event", socialEventApiRouter);

export default router;