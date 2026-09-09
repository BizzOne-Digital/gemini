import mongoose, { Schema, type Document, type Model } from "mongoose";

export type StoredUploadFolder = "products" | "gallery" | "pages" | "misc";

export interface IStoredUpload extends Document {
  folder: StoredUploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const StoredUploadSchema = new Schema<IStoredUpload>(
  {
    folder: {
      type: String,
      required: true,
      enum: ["products", "gallery", "pages", "misc"],
    },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

const StoredUpload: Model<IStoredUpload> =
  mongoose.models.StoredUpload ||
  mongoose.model<IStoredUpload>("StoredUpload", StoredUploadSchema);

export default StoredUpload;
