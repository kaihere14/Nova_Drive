import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenAI } from "@google/genai";
import FileModel from '../models/fileSchema.model.js';


const myQueue = new Queue('ai-processing-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export async function addJobs(fileName: string, mimeType: string, size: number, fileId: string) {
  await myQueue.add('ai-processing-queue', { fileName, mimeType, size, fileId });
  console.log('Job added to AI processing queue for file:', fileName, 'with ID:', fileId);
}



const connection = new IORedis({ maxRetriesPerRequest: null });

const ai = new GoogleGenAI({});

const worker = new Worker(
  'ai-processing-queue',
  async job => {
    const { fileName, mimeType, size, fileId } = job.data;

    try {
      // Update status to processing
      await FileModel.findByIdAndUpdate(fileId, { aiStatus: 'processing' });
      console.log(`AI Processing started for file: ${fileName} (ID: ${fileId})`);

      const prompt = `
You are an AI file organizer for a cloud storage app.

Given this file metadata:
- File name: ${fileName}
- MIME type: ${mimeType}
- Size (bytes): ${size}

1. Infer what type of content this likely is.
2. Try to guess the file's purpose or topic.
3. Generate 3–8 short, lowercase tags (single or two words).
4. Generate a 1–2 sentence summary describing the file in a user-friendly way.

Return strictly in JSON:
{
  "tags": ["tag1", "tag2"],
  "summary": "..."
}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rawText = response.text ?? '{}';

      // Remove markdown code blocks if present
      rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let parsed: { tags?: string[]; summary?: string } = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Failed to parse AI response, using defaults:", parseErr);
        console.warn("Raw response:", rawText);
        
        // Update status to failed
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: 'failed' });
        throw parseErr;
      }

      // Update database with AI results
      await FileModel.findByIdAndUpdate(fileId, {
        tags: parsed.tags || [],
        summary: parsed.summary || '',
        aiStatus: 'completed',
      });

   
    } catch (err) {
      console.error("AI Processing Failed for file:", fileName, err);
      
      // Update status to failed if not already done
      try {
        await FileModel.findByIdAndUpdate(fileId, { aiStatus: 'failed' });
      } catch (updateErr) {
        console.error("Failed to update error status:", updateErr);
      }
      
      throw err;
    }
  },
  { connection },
);
