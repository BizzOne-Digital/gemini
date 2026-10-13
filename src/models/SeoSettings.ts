import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPageSeo {
  path: string;
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex: boolean;
}

export interface ISeoSettings extends Document {
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage?: string;
  pages: IPageSeo[];
  createdAt: Date;
  updatedAt: Date;
}

const PageSeoSchema = new Schema({
  path: { type: String, required: true },
  title: String,
  description: String,
  canonicalUrl: String,
  ogImage: String,
  noIndex: { type: Boolean, default: false },
});

const SeoSettingsSchema = new Schema<ISeoSettings>(
  {
    defaultTitle: {
      type: String,
      default: "Homestyle Diner | Homemade Comfort Food in Waterloo, ON",
    },
    defaultDescription: {
      type: String,
      default:
        "Family-owned diner in Waterloo since 1987. Hearty breakfasts, slow-cooked favourites, and freshly baked pies. Dine-in, takeout, catering, and group dining.",
    },
    defaultOgImage: String,
    pages: [PageSeoSchema],
  },
  { timestamps: true }
);

const SeoSettings: Model<ISeoSettings> =
  mongoose.models.SeoSettings ||
  mongoose.model<ISeoSettings>("SeoSettings", SeoSettingsSchema);

export default SeoSettings;
