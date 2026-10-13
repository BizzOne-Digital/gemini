import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    image: String,
    imageAlt: String,
    icon: String,
    ctaLabel: { type: String, default: "Learn More" },
    ctaHref: { type: String, default: "/contact" },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ServiceSchema.index({ displayOrder: 1 });

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
