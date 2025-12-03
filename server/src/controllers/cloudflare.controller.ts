import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Request, Response } from "express";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const Bucket = process.env.R2_BUCKET_NAME!;

export async function r2CreateMultipart(
  key: string,
  filename?: string,
  contentType?: string
) {
  try {
    // Sanitize filename - keep only letters (a-z, A-Z) and dots, remove everything else
    const sanitizedFilename = filename
      ? filename.replace(/[^a-zA-Z.]/g, "") || "file"
      : "file";

    const cmd = new CreateMultipartUploadCommand({
      Bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        originalname: sanitizedFilename, // 💾 Store sanitized filename in metadata
      },
    });
    console.log("Creating multipart upload for key:", key, "with metadata:", {
      originalname: sanitizedFilename,
    });

    const response = await r2.send(cmd);
    return response.UploadId!;
  } catch (error) {
    console.error("Error creating multipart upload:", error);
    throw error;
  }
}

export async function r2GetPresignedUrl(
  key: string,
  uploadId: string,
  partNumber: number
) {
  const cmd = new UploadPartCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  console.log("Getting presigned URL for key:", key, "partNumber:", partNumber);

  const url = await getSignedUrl(r2, cmd, { expiresIn: 600 });
  return url;
}

export async function r2CompleteMultipart(
  uploadId: string,
  key: string,
  parts: Array<{ partNumber: number; ETag: string }>
) {
  if (!uploadId || !key || !Array.isArray(parts)) {
    throw new Error(
      "Missing required parameters for completing multipart upload"
    );
  }

  try {
    // AWS SDK expects Parts: [{ PartNumber: Number, ETag: string }, ...]
    const cmd = new CompleteMultipartUploadCommand({
      Bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({
          PartNumber: Number(p.partNumber),
          ETag: String(p.ETag),
        })),
      },
    });

    console.log(
      "Completing multipart upload for key:",
      key,
      "uploadId:",
      uploadId
    );
    const result = await r2.send(cmd);
    console.log("Multipart upload completed successfully");

    return result;
  } catch (err) {
    console.error("Complete multipart failed:", err);
    throw err;
  }
}

export async function r2AbortMultipart(uploadId: string, key: string) {
  try {
    const cmd = new AbortMultipartUploadCommand({
      Bucket,
      Key: key,
      UploadId: uploadId,
    });

    console.log(
      "Aborting multipart upload for key:",
      key,
      "uploadId:",
      uploadId
    );
    await r2.send(cmd);
    console.log("Multipart upload aborted successfully");
  } catch (err) {
    console.error("Abort multipart failed:", err);
    throw err;
  }
}

export async function r2ListObjects(req: Request, res: Response) {
  const { userId } = req.params;
  try {
    const cmd = new ListObjectsV2Command({
      Bucket,
      Prefix: `uploads/${userId}/`,
    });
    const response = await r2.send(cmd);

    // Retrieve metadata for each file to get original filename
    const filesWithMetadata = await Promise.all(
      (response.Contents || []).map(async (file) => {
        try {
          const headCmd = new HeadObjectCommand({
            Bucket,
            Key: file.Key,
          });
          const headResponse = await r2.send(headCmd);

          return {
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            eTag: file.ETag,
            originalName: headResponse.Metadata?.originalname || "unknown",
            contentType: headResponse.ContentType,
          };
        } catch (err) {
          console.error(`Error getting metadata for ${file.Key}:`, err);
          return {
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            eTag: file.ETag,
            originalName: "unknown",
          };
        }
      })
    );

    return res.json({
      success: true,
      userId,
      count: filesWithMetadata.length,
      files: filesWithMetadata,
    });
  } catch (err) {
    console.error("List objects failed:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { key, filename, userId } = req.body;

    if (!userId || !key || !key.startsWith(`uploads/${userId}/`)) {
      return res.status(403).json({ error: "Forbidden or invalid request" });
    }

    // If no filename provided, try to get it from metadata
    let originalName = filename;
    if (!originalName) {
      try {
        const headCmd = new HeadObjectCommand({
          Bucket,
          Key: key,
        });
        const headResponse = await r2.send(headCmd);
        originalName = headResponse.Metadata?.originalname || "downloaded-file";
      } catch (err) {
        console.error("Error retrieving metadata:", err);
        originalName = "downloaded-file";
      }
    }

    const cmd = new GetObjectCommand({
      Bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
        originalName
      )}"`,
    });

    const url = await getSignedUrl(r2, cmd, { expiresIn: 60 });

    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download url" });
  }
};

export const deleteUserFile = async (req: Request, res: Response) => {
  try {
    const { userId, key } = req.body;

    // Security: Prevent deleting someone else's files
    if (!key.startsWith(`uploads/${userId}/`)) {
      return res.status(403).json({ error: "Forbidden — not your file" });
    }

    // Delete from Cloudflare R2
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    return res.json({ success: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete file error:", err);
    res.status(500).json({ error: "Failed to delete file", details: err });
  }
};
