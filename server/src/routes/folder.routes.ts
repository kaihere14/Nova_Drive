import { Router } from "express";
import {  createFolder, deleteFolder, getFolders, renameFolder } from "../controllers/folderConrtoller.js";
import { verifyJwt } from "../middleware/verifyJwt.js";
const router = Router();

// Create a new folder
router.post("/create", verifyJwt, createFolder);
// Get folders
router.get("/", verifyJwt, getFolders);
// Delete a folder
router.delete("/:folderId", verifyJwt, deleteFolder);

//Rename a folder
router.post("/rename/:folderId", verifyJwt,renameFolder);


// Health check route
router.get("/health", (req, res) => {
    res.status(200).json({ message: "Folder route is healthy" });
});

export default router;