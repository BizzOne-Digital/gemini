import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISectionContent {
  key: string;
  heading?: string;
  subheading?: string;
  description?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  image?: string;
  imageAlt?: string;
  isVisible: boolean;
  displayOrder: number;
  metadata?: Record<string, unknown>;
}

export interface IPageContent extends Document {
  pageSlug: string;
  pageTitle: string;
  sections: ISectionContent[];
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema({
  key: { type: String, required: true },
  heading: String,
  subheading: String,
  description: String,
  eyebrow: String,
  ctaLabel: String,
  ctaHref: String,
  ctaSecondaryLabel: String,
  ctaSecondaryHref: String,
  image: String,
  imageAlt: String,
  isVisible: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
});

const PageContentSchema = new Schema<IPageContent>(
  {
    pageSlug: { type: String, required: true, unique: true },
    pageTitle: { type: String, required: true },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

const PageContent: Model<IPageContent> =
  mongoose.models.PageContent ||
  mongoose.model<IPageContent>("PageContent", PageContentSchema);

export default PageContent;
