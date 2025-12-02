import { Router } from "express";
import multer from "multer";
import { completeUpload, computeHashCheck, deleteHashSession, getUploadStatus, loggingHash, preAssignUrls, uploadChunk, uploadInitiate } from "../controllers/chunks.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Example chunk routes
router.post("/compute-hash-check", computeHashCheck);
router.post("/logging-hash", loggingHash);
router.post("/upload-initiate", uploadInitiate);
router.post("/upload-chunk",upload.single("chunk"), uploadChunk);
router.post("/upload-complete", completeUpload);
router.post("/upload-status/:sessionId", getUploadStatus);
router.delete("/delete-hash-session/:sessionId", deleteHashSession);
router.post("/get-presigned-url", preAssignUrls);


export default router;
