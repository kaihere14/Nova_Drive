import { Queue } from "bullmq";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { GoogleGenAI } from "@google/genai";
import FileModel from "../models/fileSchema.model.js";
import { getPresignedDownloadUrl } from "../controllers/cloudflare.controller.js";
import pdf from "pdf-parse";

// Helper function for fetch with timeout
async function fetchWithTimeout(url: string, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Initialize AI instances with different API keys for specific tasks
const aiForImageAnalysis = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_1,
});
const aiForPdfTagGeneration = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_2,
});
const aiForImageTagGeneration = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_3,
});
const aiForOtherFileTagGeneration = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_4,
});

// Create a single shared Redis connection
export const connection = new IORedis({
  host: "redis-15783.crce179.ap-south-1-1.ec2.cloud.redislabs.com",
  port: 15783,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnect attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
});

// Add error handlers for Redis connection
connection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

connection.on("connect", () => {
  console.log("Redis connected successfully");
});

connection.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

connection.on("close", () => {
  console.log("Redis connection closed");
});

// Reuse the same connection for all queues
const myQueue = new Queue("pdfAi-processing-queue", { connection });
const imageQueue = new Queue("imageAi-processing-queue", { connection });
const otherQueue = new Queue("other-processing-queue", { connection });
const extractionQueue = new Queue("metadata-extraction-queue", { connection });

export async function extractData(
  fileId: string,
  fileName: string,
  mimeType: string,
  r2Key: string,
  userId?: string
) {
  await extractionQueue.add("metadata-extraction-job", {
    fileId,
    fileName,
    mimeType,
    r2Key,
    userId,
  });
}

export async function pdfTags(
  fileName: string,
  mimeType: string,
  fileId: string,
  extractData: string
) {
  await myQueue.add("pdfAi-processing-queue", {
    fileName,
    mimeType,
    fileId,
    extractData,
  });
}

export async function imageTags(
  fileName: string,
  mimeType: string,
  fileId: string,
  extractData: string
) {
  await imageQueue.add("imageAi-processing-queue", {
    fileName,
    mimeType,
    fileId,
    extractData,
  });
}

export async function otherTags(
  fileName: string,
  mimeType: string,
  fileId: string
) {
  await otherQueue.add("other-processing-queue", {
    fileName,
    mimeType,
    fileId,
  });
}

const workerExtraction = new Worker(
  "metadata-extraction-queue",
  async (job) => {
    const { fileId, fileName, mimeType, r2Key, userId } = job.data;
    try {
      // Update status to processing
      await FileModel.findByIdAndUpdate(fileId, { aiStatus: "processing" });

      const presignedUrl = await getPresignedDownloadUrl(r2Key, userId);
      if (!presignedUrl) {
        throw new Error("Failed to get presigned URL");
      }
      if (mimeType.startsWith("image/")) {
        const imageUrl = presignedUrl;
        const response = await fetchWithTimeout(imageUrl);
        const imageArrayBuffer = await response.arrayBuffer();
        const base64ImageData =
          Buffer.from(imageArrayBuffer).toString("base64");
        const result = await aiForImageAnalysis.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageData,
              },
            },
            { text: "Caption this image." },
          ],
        });
        const extractData = result.text ?? "";
        const summary = extractData.slice(0, 1000);
        imageTags(fileName, mimeType, fileId, summary);
      } else if (mimeType === "application/pdf") {
        const response = await fetchWithTimeout(presignedUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const textContent = data.text;
        const summary = textContent.slice(0, 1000);
        pdfTags(fileName, mimeType, fileId, summary);
      } else {
        // For other file types, generate tags based on filename and MIME type
        otherTags(fileName, mimeType, fileId);
      }
    } catch (err) {
      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr) {
        console.error("Failed to update error status:", updateErr);
      }
      throw err;
    }
  },
  { connection }
);

const worker = new Worker(
  "pdfAi-processing-queue",
  async (job) => {
    const { fileName, mimeType, extractData, fileId } = job.data;
    try {
      await FileModel.findByIdAndUpdate(fileId, { aiStatus: "processing" });
      const prompt = `
You are an AI file organizer for a cloud storage app.

Given this file metadata:
- File name: ${fileName}
- MIME type: ${mimeType}
- Extracted content preview: ${extractData}

1. Analyze the file name and extracted content to determine the file's purpose and topic.
2. Generate 3–8 short, lowercase tags (single or two words) that best describe the content.
3. Generate a 1–2 sentence summary describing the file in a user-friendly way based on the extracted content.

Return strictly in JSON:
{
  "tags": ["tag1", "tag2"],
  "summary": "..."
}`.trim();
      const response = await aiForPdfTagGeneration.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      let rawText = response.text ?? "{}";
      rawText = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      let parsed: { tags?: string[]; summary?: string } = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
        throw parseErr;
      }
      await FileModel.findByIdAndUpdate(fileId, {
        tags: parsed.tags || [],
        summary: parsed.summary || "",
        aiStatus: "completed",
      });
    } catch (err) {
      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr) {}
      throw err;
    }
  },
  { connection }
);

const imageWorker = new Worker(
  "imageAi-processing-queue",
  async (job) => {
    const { fileName, mimeType, extractData, fileId } = job.data;

    try {
      // Update status to processing

      const prompt = `
You are an AI image analyzer for a cloud storage app.

Given this image metadata:
- File name: ${fileName}
- MIME type: ${mimeType}
- Extracted content preview: ${extractData}

1. Analyze the image content to determine its purpose and topic.
2. Generate 3–8 short, lowercase tags (single or two words) that best describe the image content.
3. Generate a 1–2 sentence summary describing the image in a user-friendly way based on the extracted content.

Return strictly in JSON:
{
  "tags": ["tag1", "tag2"],
  "summary": "..."
}`.trim();

      const response = await aiForImageTagGeneration.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rawText = response.text ?? "{}";

      // Remove markdown code blocks if present
      rawText = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let parsed: { tags?: string[]; summary?: string } = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Failed to parse AI response, using defaults:", parseErr);
        console.warn("Raw response:", rawText);

        // Update status to failed
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
        throw parseErr;
      }

      // Update database with AI results
      await FileModel.findByIdAndUpdate(fileId, {
        tags: parsed.tags || [],
        summary: parsed.summary || "",
        aiStatus: "completed",
      });

      console.log(
        `AI Processing completed for image: ${fileName} (ID: ${fileId})`
      );
    } catch (err) {
      console.error("AI Processing Failed for image:", fileName, err);

      // Update status to failed if not already done
      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr) {
        console.error("Failed to update error status:", updateErr);
      }

      throw err;
    }
  },
  { connection }
);

const otherWorker = new Worker(
  "other-processing-queue",
  async (job) => {
    const { fileName, mimeType, fileId } = job.data;

    try {
      await FileModel.findByIdAndUpdate(fileId, { aiStatus: "processing" });
      console.log(
        `AI Processing started for other file: ${fileName} (ID: ${fileId})`
      );

      const prompt = `
You are an AI file organizer for a cloud storage app.

Given this file metadata:
- File name: ${fileName}
- MIME type: ${mimeType}

Based ONLY on the file name and MIME type:
1. Guess what type of content this file likely contains.
2. Generate 3–8 short, lowercase tags (single or two words) that best describe what this file might be.
3. Generate a 1–2 sentence summary describing what this file is likely about based on its name and type.

Return strictly in JSON:
{
  "tags": ["tag1", "tag2"],
  "summary": "..."
}`.trim();

      const response = await aiForOtherFileTagGeneration.models.generateContent(
        {
          model: "gemini-2.5-flash",
          contents: prompt,
        }
      );

      let rawText = response.text ?? "{}";
      rawText = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let parsed: { tags?: string[]; summary?: string } = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn(
          "Failed to parse AI response for other file, using defaults:",
          parseErr
        );
        console.warn("Raw response:", rawText);

        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
        throw parseErr;
      }

      await FileModel.findByIdAndUpdate(fileId, {
        tags: parsed.tags || [],
        summary: parsed.summary || "",
        aiStatus: "completed",
      });

      console.log(
        `AI Processing completed for other file: ${fileName} (ID: ${fileId})`
      );
    } catch (err) {
      console.error("AI Processing Failed for other file:", fileName, err);

      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr) {
        console.error("Failed to update error status:", updateErr);
      }

      throw err;
    }
  },
  { connection }
);

// Store workers for graceful shutdown
export const workers = [workerExtraction, worker, imageWorker, otherWorker];
export const queues = [myQueue, imageQueue, otherQueue, extractionQueue];

// Add error handlers to all workers
workerExtraction.on("error", (err) => {
  console.error("Worker extraction error:", err);
});

workerExtraction.on("failed", (job, err) => {
  console.error(`Extraction job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("PDF AI worker error:", err);
});

worker.on("failed", (job, err) => {
  console.error(`PDF AI job ${job?.id} failed:`, err);
});

imageWorker.on("error", (err) => {
  console.error("Image AI worker error:", err);
});

imageWorker.on("failed", (job, err) => {
  console.error(`Image AI job ${job?.id} failed:`, err);
});

otherWorker.on("error", (err) => {
  console.error("Other file worker error:", err);
});

otherWorker.on("failed", (job, err) => {
  console.error(`Other file job ${job?.id} failed:`, err);
});
