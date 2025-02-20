import { Router } from "express";

import apiRouter from "./api_router.js";

const router = Router();

router.use("/", apiRouter);

export default router;