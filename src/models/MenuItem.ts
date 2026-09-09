import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IMenuVariant {
  name: string;
  price: number;
  isDefault: boolean;
}

export interface IMenuAddOn {
  name: string;
  price: number;
}

export interface IMenuItem extends Document {
  name: string;
  slug: string;
  normalizedName: string;
  sku?: string;
  description?: string;
  price: number;
  salePrice?: number;
  currency: string;
  category: Types.ObjectId;
  subcategory?: string;
  image?: string;
  imageAlt?: string;
  dietaryTags: string[];
  allergens: string[];
  variants: IMenuVariant[];
  addOns: IMenuAddOn[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  displayOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema({
  name: String,
  price: Number,
  isDefault: { type: Boolean, default: false },
});

const AddOnSchema = new Schema({
  name: String,
  price: Number,
});

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    normalizedName: { type: String, required: true },
    sku: String,
    description: String,
    price: { type: Number, required: true },
    salePrice: Number,
    currency: { type: String, default: "CAD" },
    category: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    subcategory: String,
    image: String,
    imageAlt: String,
    dietaryTags: [String],
    allergens: [String],
    variants: [VariantSchema],
    addOns: [AddOnSchema],
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MenuItemSchema.index({ slug: 1 });
MenuItemSchema.index({ normalizedName: 1 });
MenuItemSchema.index({ category: 1, displayOrder: 1 });
MenuItemSchema.index({ isFeatured: 1 });
MenuItemSchema.index({ isPopular: 1 });

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
