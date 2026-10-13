import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INavLink {
  label: string;
  href: string;
  openInNewTab: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export interface INavigation extends Document {
  links: INavLink[];
  ctaCall: { label: string; href: string; isVisible: boolean };
  ctaOrder: { label: string; href: string; isVisible: boolean; openInNewTab: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const NavLinkSchema = new Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  openInNewTab: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

const NavigationSchema = new Schema<INavigation>(
  {
    links: [NavLinkSchema],
    ctaCall: {
      label: { type: String, default: "Call Now" },
      href: { type: String, default: "tel:5197255048" },
      isVisible: { type: Boolean, default: true },
    },
    ctaOrder: {
      label: { type: String, default: "Order Online" },
      href: String,
      isVisible: { type: Boolean, default: true },
      openInNewTab: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Navigation: Model<INavigation> =
  mongoose.models.Navigation || mongoose.model<INavigation>("Navigation", NavigationSchema);

export default Navigation;
