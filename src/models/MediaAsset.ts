import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMediaAsset extends Document {
  url: string;
  publicId: string;
  filename: string;
  folder: string;
  altText: string;
  title: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  usageCount: number;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    folder: { type: String, required: true },
    altText: { type: String, default: "" },
    title: { type: String, default: "" },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    usageCount: { type: Number, default: 0 },
    uploadedBy: String,
  },
  { timestamps: true }
);

MediaAssetSchema.index({ folder: 1 });

const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export default MediaAsset;
