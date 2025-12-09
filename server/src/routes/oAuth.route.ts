import { Router } from "express";
import { googleAuthCallback, googleAuthRedirect } from "../controllers/oAuth.Controller.js";

const router = Router();

// Google OAuth route
router.get("/", googleAuthRedirect);
router.get("/callback", googleAuthCallback);


export default router;
