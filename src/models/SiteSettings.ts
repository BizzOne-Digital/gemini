import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ISiteSettings extends Document {
  publicBusinessName: string;
  legalBusinessName: string;
  primaryEmail: string;
  notificationEmail: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  mapUrl: string;
  directionsUrl: string;
  timezone: string;
  businessHours: IBusinessHours[];
  facebookUrl: string;
  instagramUrl: string;
  orderOnlineUrl: string;
  logos: {
    main?: string;
    light?: string;
    dark?: string;
    mobile?: string;
    favicon?: string;
    footer?: string;
    altText: string;
  };
  announcementBar: {
    enabled: boolean;
    message: string;
    link?: string;
  };
  footerDescription: string;
  currency: string;
  pricingDisclaimer: string;
  bookingEnabled: boolean;
  cateringEnabled: boolean;
  newsletterEnabled: boolean;
  parkingNotes: string;
  accessibilityNotes: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  searchConsoleVerification: string;
  cookieConsentEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessHoursSchema = new Schema({
  day: String,
  open: String,
  close: String,
  isClosed: { type: Boolean, default: false },
});

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    publicBusinessName: { type: String, default: "Homestyle Diner" },
    legalBusinessName: {
      type: String,
      default: "Gemini-SR Enterprise Inc. O/A Gemini Homestyle Diner",
    },
    primaryEmail: { type: String, default: "homestylewaterloo@gmail.com" },
    notificationEmail: { type: String, default: "homestylewaterloo@gmail.com" },
    phone: { type: String, default: "519-725-5048" },
    address: { type: String, default: "504 Albert St" },
    city: { type: String, default: "Waterloo" },
    province: { type: String, default: "ON" },
    postalCode: { type: String, default: "N2L 3V4" },
    country: { type: String, default: "Canada" },
    mapUrl: String,
    directionsUrl: String,
    timezone: { type: String, default: "America/Toronto" },
    businessHours: [BusinessHoursSchema],
    facebookUrl: {
      type: String,
      default: "https://www.facebook.com/Homestyledinerwaterloo/",
    },
    instagramUrl: String,
    orderOnlineUrl: String,
    logos: {
      main: String,
      light: String,
      dark: String,
      mobile: String,
      favicon: String,
      footer: String,
      altText: { type: String, default: "Homestyle Diner" },
    },
    announcementBar: {
      enabled: { type: Boolean, default: false },
      message: String,
      link: String,
    },
    footerDescription: {
      type: String,
      default:
        "Family-owned and operated in Waterloo since 1987. Homemade comfort food, served with heart.",
    },
    currency: { type: String, default: "CAD" },
    pricingDisclaimer: {
      type: String,
      default: "Menu items, pricing, and availability are subject to change.",
    },
    bookingEnabled: { type: Boolean, default: true },
    cateringEnabled: { type: Boolean, default: true },
    newsletterEnabled: { type: Boolean, default: false },
    parkingNotes: String,
    accessibilityNotes: String,
    googleAnalyticsId: String,
    metaPixelId: String,
    searchConsoleVerification: String,
    cookieConsentEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
