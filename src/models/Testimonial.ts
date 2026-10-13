import mongoose, { Schema, type Document, type Model } from "mongoose";

export type TestimonialStatus = "pending" | "approved" | "rejected" | "archived";

export interface ITestimonial extends Document {
  customerName: string;
  customerPhoto?: string;
  rating: number;
  reviewText: string;
  source?: string;
  visitType?: string;
  status: TestimonialStatus;
  isFeatured: boolean;
  reviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    customerPhoto: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    source: String,
    visitType: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    reviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TestimonialSchema.index({ status: 1 });
TestimonialSchema.index({ isFeatured: 1 });

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
