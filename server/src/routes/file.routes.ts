import { Router } from "express";
import { listFiles } from "../controllers/file.controller.js";
import { verifyJwt } from "../utils/verifyJwt.js";

const router = Router();

// File listing route
router.get("/list-files", verifyJwt, listFiles);

export default router;