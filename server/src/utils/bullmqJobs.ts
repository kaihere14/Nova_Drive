import { Queue } from "bullmq";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { GoogleGenAI } from "@google/genai";
import FileModel from "../models/fileSchema.model.js";
import { getPresignedDownloadUrl } from "../controllers/cloudflare.controller.js";
import pdf from "pdf-parse";
import { logger } from "../index.js";

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
  connectTimeout: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.info("redis_reconnect_attempt", { attempt: times, delayMs: delay });
    return delay;
  },
});

// Add error handlers for Redis connection
connection.on("error", (err) => {
  logger.error("redis_connection_error", {
    error: err.message,
    stack: err.stack,
  });
});

connection.on("connect", () => {
  logger.info("redis_connected");
});

connection.on("reconnecting", () => {
  logger.info("redis_reconnecting");
});

connection.on("close", () => {
  logger.info("redis_connection_closed");
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
      } catch (updateErr: any) {
        logger.error("ai_status_update_failed", {
          fileId,
          fileName,
          error: updateErr.message,
          stack: updateErr.stack,
        });
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
      } catch (parseErr: any) {
        logger.warn("ai_response_parse_failed", {
          fileId,
          fileName,
          mimeType,
          worker: "image",
          error: parseErr.message,
          rawResponsePreview: rawText.substring(0, 200),
        });

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

      logger.info("ai_processing_completed", {
        fileId,
        fileName,
        mimeType,
        worker: "image",
        tagsCount: (parsed.tags || []).length,
      });
    } catch (err: any) {
      logger.error("ai_processing_failed", {
        fileId,
        fileName,
        mimeType,
        worker: "image",
        error: err.message,
        stack: err.stack,
      });

      // Update status to failed if not already done
      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr: any) {
        logger.error("ai_status_update_failed", {
          fileId,
          fileName,
          worker: "image",
          error: updateErr.message,
          stack: updateErr.stack,
        });
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
      logger.info("ai_processing_started", {
        fileId,
        fileName,
        mimeType,
        worker: "other",
      });

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
      } catch (parseErr: any) {
        logger.warn("ai_response_parse_failed", {
          fileId,
          fileName,
          mimeType,
          worker: "other",
          error: parseErr.message,
          rawResponsePreview: rawText.substring(0, 200),
        });

        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
        throw parseErr;
      }

      await FileModel.findByIdAndUpdate(fileId, {
        tags: parsed.tags || [],
        summary: parsed.summary || "",
        aiStatus: "completed",
      });

      logger.info("ai_processing_completed", {
        fileId,
        fileName,
        mimeType,
        worker: "other",
        tagsCount: (parsed.tags || []).length,
      });
    } catch (err: any) {
      logger.error("ai_processing_failed", {
        fileId,
        fileName,
        mimeType,
        worker: "other",
        error: err.message,
        stack: err.stack,
      });

      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: "failed" });
      } catch (updateErr: any) {
        logger.error("ai_status_update_failed", {
          fileId,
          fileName,
          worker: "other",
          error: updateErr.message,
          stack: updateErr.stack,
        });
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
  logger.error("worker_error", {
    workerName: "extraction",
    error: err.message,
    stack: err.stack,
  });
});

workerExtraction.on("failed", (job, err) => {
  logger.error("worker_job_failed", {
    workerName: "extraction",
    jobId: job?.id,
    jobData: job?.data,
    error: err.message,
    stack: err.stack,
  });
});

worker.on("error", (err) => {
  logger.error("worker_error", {
    workerName: "pdf_ai",
    error: err.message,
    stack: err.stack,
  });
});

worker.on("failed", (job, err) => {
  logger.error("worker_job_failed", {
    workerName: "pdf_ai",
    jobId: job?.id,
    jobData: job?.data,
    error: err.message,
    stack: err.stack,
  });
});

imageWorker.on("error", (err) => {
  logger.error("worker_error", {
    workerName: "image_ai",
    error: err.message,
    stack: err.stack,
  });
});

imageWorker.on("failed", (job, err) => {
  logger.error("worker_job_failed", {
    workerName: "image_ai",
    jobId: job?.id,
    jobData: job?.data,
    error: err.message,
    stack: err.stack,
  });
});

otherWorker.on("error", (err) => {
  logger.error("worker_error", {
    workerName: "other_file",
    error: err.message,
    stack: err.stack,
  });
});

otherWorker.on("failed", (job, err) => {
  logger.error("worker_job_failed", {
    workerName: "other_file",
    jobId: job?.id,
    jobData: job?.data,
    error: err.message,
    stack: err.stack,
  });
});
