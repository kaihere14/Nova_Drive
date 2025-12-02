import { Request, Response } from "express";
import chunkModel from "../models/chunk.model.js";
import fs from "fs";
import { v4 as uuid } from "uuid";
import Hash from "../models/hashModel.js";

interface UploadInitiateBody {
  userId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  totalChunks: number;
  chunkSize: number;
}

interface UploadChunkBody {
  sessionId: string;
  index: string;
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const loggingHash = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileHash, sessionId } = req.body;

    if (!fileHash || !sessionId) {
      res.status(400).json({ message: "Missing fileHash or sessionId field" });
      return;
    }

    const newHash = new Hash({ fileHash, sessionId });
    await newHash.save();

    res.status(201).json({ message: "File hash logged successfully" });
  } catch (error) {
    console.error("Error logging file hash:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const computeHashCheck = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {
    const { fileHash } = req.body;

    if (!fileHash) {
      res.status(400).json({ message: "Missing fileHash field" });
      return;
    }

    const existingHash = await Hash.findOne({ fileHash });
    if (existingHash) {
      res.status(200).json({ exists: true, sessionId: existingHash.sessionId });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking file hash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadInitiate = async (
  req: Request<{}, {}, UploadInitiateBody>,
  res: Response
): Promise<void> => {
  try {
    const { userId, fileName, fileSize, contentType, totalChunks, chunkSize } =
      req.body;

    if (
      !userId ||
      !fileName ||
      !fileSize ||
      !contentType ||
      !totalChunks ||
      !chunkSize
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours
    const tempSessionDir = `./uploads/temp/${userId}/${uuid()}/`;
    if (!fs.existsSync(tempSessionDir)) {
      fs.mkdirSync(tempSessionDir, { recursive: true });
    }
    const finalStorageKey = `./uploads/final/${userId}/${uuid() + fileName}`;

    const newUploadSession = new chunkModel({
      userId,
      fileName,
      fileSize,
      contentType,
      totalChunks,
      chunkSize,
      tempStorageKey: tempSessionDir,
      finalStorageKey,
      expiresAt,
    });

    const savedSession = await newUploadSession.save();

    res.status(201).json({
      message: "Upload session initiated",
      uploadSessionId: savedSession._id,
    });
  } catch (error) {
    console.error("Error initiating upload session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadChunk = async (
  req: MulterRequest & Request<{}, {}, UploadChunkBody>,
  res: Response
): Promise<unknown> => {
  try {
    const { sessionId, index } = req.body;
    const chunkIndex = parseInt(index);
    console.log("Uploading chunk:", { sessionId, chunkIndex });

    // 1. Fetch session
    const session = await chunkModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Invalid session" });
    }

    // 2. Validate index
    if (
      isNaN(chunkIndex) ||
      chunkIndex < 0 ||
      chunkIndex >= session.totalChunks
    ) {
      return res.status(400).json({ error: "Invalid chunk index" });
    }

    // 3. Ensure chunk uploaded only once
    if (session.receivedChunks.get(chunkIndex.toString())) {
      res.status(409).json({ error: "Chunk already uploaded" });
      return;
    }

    // 4. Ensure chunk exists in request
    if (!req.file) {
      res.status(400).json({ error: "Missing chunk file" });
      return;
    }

    // 5. Determine chunk path
    const chunkDir = session.tempStorageKey; // e.g. "./uploads/temp/...uuid..."
    const chunkPath = `${chunkDir}/chunk-${chunkIndex}`;

    // 6. Save chunk to disk
    await fs.promises.writeFile(chunkPath, req.file.buffer);

    // 7. Mark chunk as received in DB
    session.receivedChunks.set(chunkIndex.toString(), true);
    session.status = "uploading";
    await session.save();

    res.json({
      success: true,
      received: chunkIndex,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const completeUpload = async (
  req: Request,
  res: Response
): Promise<unknown> => {
  try {
    const { sessionId } = req.body;

    const session = await chunkModel.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Invalid session" });

    // 1. Ensure all chunks arrived
    const missing: any = [];
    for (let i = 0; i < session.totalChunks; i++) {
      if (!session.receivedChunks.get(i.toString())) {
        missing.push(i);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Missing chunks",
        missing,
      });
    }

    // 2. Merge chunks
    const finalPath = session.finalStorageKey;
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath.substring(0, finalPath.lastIndexOf("/")), {
        recursive: true,
      });
    }
    const finalWriteStream = fs.createWriteStream(finalPath);

for (let i = 0; i < session.totalChunks; i++) {
    const chunkPath = `${session.tempStorageKey}/chunk-${i}`;
    await new Promise((resolve:any, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.pipe(finalWriteStream, { end: false });
        readStream.on("end", resolve);
        readStream.on("error", reject);
    });
}

finalWriteStream.end();



    // 3. Cleanup temp folder
    await fs.promises.rm(session.tempStorageKey, {
      recursive: true,
      force: true,
    });

    // 4. Update session
    session.status = "completed";
    await session.save();

    res.json({
      success: true,
      file: finalPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteHashSession = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  try {
    await Hash.findOneAndDelete({ sessionId: sessionId });
    res.status(200).json({ message: "Hash session deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUploadStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  try {
    const session = await chunkModel.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: "Invalid session" });
      return;
    }


    

    const receivedChunks: number[] = [];
    session.receivedChunks.forEach((value, key) => {
      if (value) receivedChunks.push(parseInt(key));
    });
    if (session.status === "completed") {
      Hash.findOneAndDelete({ sessionId: sessionId }).catch((err) => {
        console.error("Error deleting hash after completion:", err);
      });
    }
    
    res.json({
      status: session.status,
      receivedChunks,
      totalReceived: receivedChunks.length,
      totalChunks: session.totalChunks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
