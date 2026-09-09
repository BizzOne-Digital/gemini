import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMenuCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  startingPrice?: number;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    imageAlt: String,
    startingPrice: Number,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ displayOrder: 1 });

const MenuCategory: Model<IMenuCategory> =
  mongoose.models.MenuCategory ||
  mongoose.model<IMenuCategory>("MenuCategory", MenuCategorySchema);

export default MenuCategory;
