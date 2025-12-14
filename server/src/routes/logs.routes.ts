import { Router } from "express";
import { getUserActivities } from "../controllers/log.controller";
import { verifyJwt } from "../middleware/verifyJwt";

const router = Router();

// User activity logs route
router.get("/user-activities",verifyJwt, getUserActivities);

export default router;