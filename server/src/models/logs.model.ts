import { Schema, model, Document } from "mongoose";

export interface IActivity extends Document {
  userId: Schema.Types.ObjectId;
  action: 
     "file_initiated"
    | "file_uploaded"
    | "file_deleted"
    | "file_renamed"
    | "folder_created"
    | "folder_deleted"
    | "file_moved"
    | "folder_renamed"
  fileId?: Schema.Types.ObjectId;
  fileName?: string;
  newFileName?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    action: {
      type: String,
      enum: [
        "file_initiated",
        "file_uploaded",
        "file_deleted",
        "file_renamed",
        "folder_created",
        "folder_deleted",
        "file_moved",
        "folder_renamed"
      ],
      required: true,
    },

    fileId: { type: Schema.Types.ObjectId, ref: "File" },
    fileName: { type: String },
    newFileName: { type: String },

    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export  const Activity = model<IActivity>("Activity", ActivitySchema);
export default Activity;
