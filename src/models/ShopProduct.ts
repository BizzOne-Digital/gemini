import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IShopProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  imageAlt?: string;
  requiresShipping: boolean;
  isAvailable: boolean;
  displayOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopProductSchema = new Schema<IShopProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: "CAD" },
    image: String,
    imageAlt: String,
    requiresShipping: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ShopProductSchema.index({ isAvailable: 1, displayOrder: 1 });

const ShopProduct: Model<IShopProduct> =
  mongoose.models.ShopProduct ||
  mongoose.model<IShopProduct>("ShopProduct", ShopProductSchema);

export default ShopProduct;
