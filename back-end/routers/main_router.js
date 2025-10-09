// back-end/routers/main_router.js

import { Router } from "express";
import apiRouter from "./api_router.js";

const router = Router();

//update: Mount API router at root since your axios is configured for direct endpoints
router.use("/", apiRouter);

//update: Add route to handle email verification page redirect
router.get("/verify-email", (req, res) => {
    // Redirect to frontend with query parameters
    const frontendUrl = process.env.FRONTEND_URL || 'http://app.uribarri.online';
    const queryString = req.url.split('?')[1] || '';
    res.redirect(`${frontendUrl}/verify-email?${queryString}`);
});

export default router;