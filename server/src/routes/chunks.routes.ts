import { Router } from "express";
import {
  completeUpload,
  computeHashCheck,
  deleteHashSession,
  getUploadStatus,
  loggingHash,
  preAssignUrls,
  uploadInitiate,
} from "../controllers/chunks.controller.js";
import {
  
  getDownloadUrl,
  deleteUserFile,
  getPreviewUrl,
} from "../controllers/cloudflare.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.js";
import checkLimit from "../middleware/uploadLimit.js";

const router = Router();

// Multipart upload routes
router.post("/compute-hash-check",verifyJwt,checkLimit, computeHashCheck);
router.post("/logging-hash", loggingHash);
router.post("/upload-initiate", verifyJwt, uploadInitiate);
router.post("/get-presigned-url", verifyJwt,preAssignUrls);
router.post("/upload-complete", completeUpload);
router.post("/upload-status/:sessionId", getUploadStatus);
router.delete("/delete-hash-session/:sessionId", verifyJwt, deleteHashSession);



// Download route
router.post("/get-download-url",verifyJwt, getDownloadUrl);
router.post("/get-preview-url",verifyJwt, getPreviewUrl);

// Delete route
router.delete("/delete-file",verifyJwt, deleteUserFile);

export default router;
