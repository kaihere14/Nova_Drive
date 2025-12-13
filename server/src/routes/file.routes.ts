import { Router } from "express";
import { aiFileSearch, listFavouriteFiles, listFiles, moveFileToFolder, setFavourite } from "../controllers/file.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.js";

const router = Router();

// File listing route
router.get("/list-files", verifyJwt, listFiles);
router.get("/set-favourite/:fileId",  setFavourite);
router.get("/list-favourite-files", verifyJwt, listFavouriteFiles);
router.post("/move-file", verifyJwt, moveFileToFolder);
router.post("/ai-search", verifyJwt, aiFileSearch);


export default router;