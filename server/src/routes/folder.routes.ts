import { Router } from "express";
import {  createFolder, deleteFolder, fetchAllFolders, findFolderByNameOrCreate, getFolders, renameFolder, suggestedFolderNames } from "../controllers/folderConrtoller.js";
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

// Fetch all folders for a user
router.get("/get-folders/:userId", verifyJwt, fetchAllFolders);

// Health check route
router.get("/health", (req, res) => {
    res.status(200).json({ message: "Folder route is healthy" });
});

//folder-suggestion
router.post("/folder-suggestion", verifyJwt, suggestedFolderNames);

//find folder by name or create if not found
router.post("/find-or-create", verifyJwt,findFolderByNameOrCreate);
export default router;
