import { Router } from "express";
import { createOtp,forgotOtp,verifyOtp } from "../controllers/otpController.js";

const router = Router();

// Route to create OTP
router.post("/create-otp", createOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);

// Route to send forgot password OTP
router.post("/forgot-otp",forgotOtp );

export default router;