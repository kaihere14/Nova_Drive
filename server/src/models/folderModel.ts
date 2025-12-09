import {model, Schema, Document} from 'mongoose';

export interface IFolder extends Document {
  name: string;
  ownerId: Schema.Types.ObjectId;
  parentFolderId?: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parentFolderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Folder = model<IFolder>('Folder', FolderSchema);

export default Folder;