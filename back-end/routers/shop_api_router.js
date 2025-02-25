import { Router } from "express";

import shopApiController from "../controllers/shop/shop_api_controller.js";

import { handleShopCoverUpload } from "../middleware/ShopUploadMiddleware.js";

const router = Router();

router.get("/", shopApiController.getAll);

router.get('/types-of-shops', shopApiController.getTypesOfShops);

router.post("/by-type", shopApiController.getByType);

router.post("/by-id", shopApiController.getById);

router.post("/create", shopApiController.create);

router.post("/by-user-id", shopApiController.getByUserId);

router.patch("/update", shopApiController.update);

router.delete("/remove-by-id/:id_shop", shopApiController.removeById);

router.delete("/remove-by-id/with-products/:id_shop", shopApiController.removeByIdWithProducts);

router.patch("/update", shopApiController.update);

router.patch("/update-with-folder", shopApiController.updateWithFolder);

router.post("/upload-cover-image", handleShopCoverUpload, shopApiController.uploadCoverImage);

export default router;