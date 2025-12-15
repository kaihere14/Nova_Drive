import { Schema, model, Document } from "mongoose";

export interface IFile extends Document {
  r2Key: string;
  eTag?: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  bucket: string;
  owner: Schema.Types.ObjectId;
  location?: Schema.Types.ObjectId | null | string;
  favourite?: boolean;

  tags?: string[];
  summary?: string;
  aiStatus?: "pending" | "processing" | "completed" | "failed";
  uploadId?: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  r2Key: { type: String, required: true, unique: true ,index: true},
  eTag: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true ,index: true},
  originalFileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  bucket: { type: String, required: true },
  location: { type: Schema.Types.ObjectId || String || null, ref: "Folder", default: null },
  favourite: { type: Boolean, default: false },



  tags: { type: [String], default: [] },
  summary: { type: String },
  aiStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  uploadId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FileModel = model<IFile>("File", FileSchema);
export default FileModel;
