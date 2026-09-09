import mongoose, { Schema, type Document, type Model } from "mongoose";

export type InquiryReason =
  | "general"
  | "menu"
  | "catering"
  | "group_dining"
  | "accessibility"
  | "feedback"
  | "business"
  | "other";

export type InquiryStatus = "new" | "read" | "replied" | "archived";

export interface IContactInquiry extends Document {
  fullName: string;
  email: string;
  phone?: string;
  reason: InquiryReason;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    reason: {
      type: String,
      enum: ["general", "menu", "catering", "group_dining", "accessibility", "feedback", "business", "other"],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    adminNotes: String,
  },
  { timestamps: true }
);

ContactInquirySchema.index({ status: 1 });
ContactInquirySchema.index({ createdAt: -1 });

const ContactInquiry: Model<IContactInquiry> =
  mongoose.models.ContactInquiry ||
  mongoose.model<IContactInquiry>("ContactInquiry", ContactInquirySchema);

export default ContactInquiry;
