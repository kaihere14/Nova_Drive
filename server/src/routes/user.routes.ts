import { createUser, deleteUser,  getUserProfile, loginUser, refreshAccessToken, verifyUser } from "../controllers/user.controller.js";
import { Router } from "express";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/profile/:userId",verifyJwt, getUserProfile);
router.delete("/delete/:userId",verifyJwt, deleteUser);
router.get("/verify-auth", verifyJwt, verifyUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/health", (req, res) => {
    res.status(200).json({ message: "User route is healthy" });
});


export default router;