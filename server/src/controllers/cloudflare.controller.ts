import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export async function r2CreateMultipart(key: string) {
  const cmd = new CreateMultipartUploadCommand({
    Bucket,
    Key: key,
  });
  console.log("Creating multipart upload for key:", key);

  const res = await r2.send(cmd);
  return res.UploadId!;  
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
