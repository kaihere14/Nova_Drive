import { Router } from "express";
import {  createFolder, deleteFolder, getFolders } from "../controllers/folderConrtoller.js";
import { verifyJwt } from "../middleware/verifyJwt.js";
const router = Router();

// Create a new folder
router.post("/create", verifyJwt, createFolder);
// Get folders
router.get("/", verifyJwt, getFolders);
// Delete a folder
router.delete("/:folderId", verifyJwt, deleteFolder);

// New route to get total number of folders for a user


// Health check route
router.get("/health", (req, res) => {
    res.status(200).json({ message: "Folder route is healthy" });
});

export default router;