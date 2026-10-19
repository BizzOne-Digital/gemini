import "./load-env";
import mongoose from "mongoose";
import { MenuCategory, MenuItem, Service, SiteSettings } from "../src/models";
import { SITE_PHOTOS } from "../src/lib/site-photos";
import { normalizeItemName, slugify } from "../src/lib/utils";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

async function patchSettings() {
  await SiteSettings.findOneAndUpdate(
    {},
    {
      $set: {
        instagramUrl: "https://www.instagram.com/homestyle.diner/?hl=en",
        notificationEmail: "homestylewaterloo@gmail.com",
        primaryEmail: "homestylewaterloo@gmail.com",
        deliveryEnabled: false,
        onlineOrderingEnabled: true,
      },
    },
    { upsert: true }
  );
  console.log("Site settings patched (Instagram, email, pickup-only).");
}

async function patchBreakfastServiceImage() {
  const breakfastImage = {
    image: SITE_PHOTOS.breakfastOmelette,
    imageAlt: "Breakfast omelette with eggs at Homestyle Diner",
  };
  await Service.updateMany(
    {
      $or: [
        { slug: "breakfast" },
        { slug: /breakfast/i },
        { title: /breakfast/i },
      ],
    },
    { $set: breakfastImage }
  );
  console.log("Breakfast service images updated to eggs/omelette.");
}

async function ensureCoffeeMenuItem() {
  const beverages = await MenuCategory.findOne({ slug: "beverages" });
  if (!beverages) {
    console.warn("Beverages category missing — run reorganize-menu-rev2 first.");
    return;
  }

  const name = "Freshly Brewed Coffee";
  const slug = slugify(name);
  await MenuItem.findOneAndUpdate(
    { normalizedName: normalizeItemName(name) },
    {
      $set: {
        name,
        slug,
        normalizedName: normalizeItemName(name),
        price: 3.29,
        currency: "CAD",
        category: beverages._id,
        description: "Freshly brewed coffee",
        isAvailable: true,
        isOnlineOrderable: true,
        isArchived: false,
        dietaryTags: [],
        allergens: [],
        variants: [],
        addOns: [],
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
  console.log("Freshly Brewed Coffee ($3.29) ensured under Beverages.");
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  await patchSettings();
  await patchBreakfastServiceImage();
  await ensureCoffeeMenuItem();
  await mongoose.disconnect();
  console.log("Client feedback patch complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
