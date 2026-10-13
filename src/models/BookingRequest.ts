import mongoose, { Schema, type Document, type Model } from "mongoose";

export type BookingStatus =
  | "new"
  | "contacted"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "archived";

export type BookingRequestType =
  | "table"
  | "group_dining"
  | "catering"
  | "business_lunch"
  | "special_event";

export interface IStatusHistory {
  status: BookingStatus;
  note?: string;
  changedAt: Date;
  changedBy?: string;
}

export interface IBookingRequest extends Document {
  referenceNumber: string;
  requestType: BookingRequestType;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: Date;
  preferredTime: string;
  numberOfGuests: number;
  occasion?: string;
  companyName?: string;
  dietaryNotes?: string;
  additionalMessage?: string;
  status: BookingStatus;
  adminNotes?: string;
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema({
  status: String,
  note: String,
  changedAt: { type: Date, default: Date.now },
  changedBy: String,
});

const BookingRequestSchema = new Schema<IBookingRequest>(
  {
    referenceNumber: { type: String, required: true, unique: true },
    requestType: {
      type: String,
      enum: ["table", "group_dining", "catering", "business_lunch", "special_event"],
      required: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    occasion: String,
    companyName: String,
    dietaryNotes: String,
    additionalMessage: String,
    status: {
      type: String,
      enum: ["new", "contacted", "pending", "confirmed", "completed", "cancelled", "archived"],
      default: "new",
    },
    adminNotes: String,
    statusHistory: [StatusHistorySchema],
  },
  { timestamps: true }
);

BookingRequestSchema.index({ status: 1 });
BookingRequestSchema.index({ createdAt: -1 });

const BookingRequest: Model<IBookingRequest> =
  mongoose.models.BookingRequest ||
  mongoose.model<IBookingRequest>("BookingRequest", BookingRequestSchema);

export default BookingRequest;
