import { Router } from "express";
import { createOtp,verifyOtp } from "../controllers/otpController.js";

const router = Router();

// Route to create OTP
router.post("/create-otp", createOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);

export default router;