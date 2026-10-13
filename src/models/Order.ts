import mongoose, { Schema, type Document, type Model } from "mongoose";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "in_kitchen"
  | "ready"
  | "completed"
  | "cancelled"
  | "payment_failed";

export type OrderFulfillment = "pickup" | "delivery";

export type OrderSource = "menu" | "shop" | "customize";

export interface IOrderLineItem {
  lineId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  menuItemId?: string;
  shopProductId?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  source: OrderSource;
  fulfillment: OrderFulfillment;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
  pickupTime?: string;
  notes?: string;
  lineItems: IOrderLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  monerisTicket?: string;
  monerisTransactionId?: string;
  monerisResponseCode?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema({
  lineId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  menuItemId: String,
  shopProductId: String,
  notes: String,
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    source: {
      type: String,
      enum: ["menu", "shop", "customize"],
      default: "menu",
    },
    fulfillment: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "in_kitchen",
        "ready",
        "completed",
        "cancelled",
        "payment_failed",
      ],
      default: "pending_payment",
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: String,
    pickupTime: String,
    notes: String,
    lineItems: [LineItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    monerisTicket: String,
    monerisTransactionId: String,
    monerisResponseCode: String,
    paidAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
