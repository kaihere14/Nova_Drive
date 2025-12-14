import { GoogleGenAI } from "@google/genai";
import { logger } from "../index.js";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY_5!});


export const fileSearch = async (allFiles:any,query:string) => {
  const keys = [process.env.GEMINI_API_KEY_5, process.env.GEMINI_API_KEY_6, process.env.GEMINI_API_KEY_7];
  let lastError: any = null;

  for (const k of keys) {
    if (!k) continue;
    // Per-key retries with exponential backoff. If we hit a 429 (rate limit)
    // for this key, rotate immediately to the next key.
    const maxAttempts = 2;
    const baseDelayMs = 500; // backoff base
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const client = new GoogleGenAI({ apiKey: k! });
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "model",
              parts: [
                {
                  text: `
                    You are an AI assistant that searches through a user’s cloud files.
                    data : The user has the following files:
                    ${JSON.stringify(allFiles)}
                    Your job:
                    1. Understand the user's query.
                    2. Return the top 3 matching files.
                    3. For each match include:
                    - fileName
                    - filePath
                    - matchScore (0–100)
                    4.No duplicates
                    5. Respond ONLY in this JSON format:
        
                    {
                    "matches": [
                        { "fileName": "string", "filePath": "string", "matchScore": 0 }
                    ]
                    }

                    Do not add any explanation. Output pure JSON only.
`
                }
              ]
            },
            {
              role: "user",
              parts: [{ text: query }]
            }
          ]
        });

        return response.text;
      } catch (err: any) {
        lastError = err;

        // If rate-limited (429 / RESOURCE_EXHAUSTED), rotate to next key immediately
        const isRateLimit = err?.status === 429 || err?.code === 429 || (err?.error && err.error.status === "RESOURCE_EXHAUSTED") || (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));
        if (isRateLimit) {
          // Log and break attempts for this key; move to next key
          logger.warn("gemini_rate_limit_hit", {
            attempt,
            keyIndex: keys.indexOf(k) + 1,
            totalKeys: keys.length,
            error: err?.message || String(err),
          });
          break;
        }

        // For transient/network errors we retry up to maxAttempts with backoff
        if (attempt < maxAttempts) {
          const wait = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, wait));
          continue; // retry same key
        }

        // otherwise move to next key
        break;
      }
    }
  }

  // if all keys failed, throw last error
  throw lastError || new Error('All Gemini keys failed');
};

