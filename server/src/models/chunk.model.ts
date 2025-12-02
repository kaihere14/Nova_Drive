import { Schema, model, Document } from "mongoose";

export interface IUploadSession extends Document {
  userId: Schema.Types.ObjectId;
  uploadId: string; 
  fileName: string;
  fileSize: number;
  contentType: string;
  totalChunks: number;
  chunkSize: number;
  receivedChunks: Map<string, boolean>;
  tempStorageKey: string;
  finalStorageKey: string;
  status:
    | "initiated"
    | "uploading"
    | "merging"
    | "completed"
    | "failed"
    | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSessionSchema = new Schema<IUploadSession>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    uploadId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    contentType: { type: String, required: true },
    totalChunks: { type: Number, required: true },
    chunkSize: { type: Number, required: true },
    receivedChunks: {
      type: Map,
      of: Boolean,
      default: {},
    },
    tempStorageKey: { type: String, required: true },
    finalStorageKey: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "initiated",
        "uploading",
        "merging",
        "completed",
        "failed",
        "expired",
      ],
      default: "initiated",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model<IUploadSession>("UploadSession", uploadSessionSchema);
