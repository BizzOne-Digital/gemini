import "dotenv/config";
import mongoose from "mongoose";
import Service from "../src/models/Service";
import { SITE_PHOTOS } from "../src/lib/site-photos";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

const IMAGE_UPDATES: Record<string, { image: string; imageAlt: string }> = {
  bakery: {
    image: SITE_PHOTOS.bakery,
    imageAlt: "Homemade pie and bakery desserts at Homestyle Diner",
  },
  "bakery-desserts": {
    image: SITE_PHOTOS.bakeryAlt,
    imageAlt: "Decorated cheesecake from Homestyle Diner",
  },
  catering: {
    image: SITE_PHOTOS.catering,
    imageAlt: "Catering platters for events and offices",
  },
  "group-dining": {
    image: SITE_PHOTOS.groupDining,
    imageAlt: "Group dining at Homestyle Diner Waterloo",
  },
  breakfast: {
    image: SITE_PHOTOS.foodFishChips,
    imageAlt: "Classic fish and chips at Homestyle Diner",
  },
  lunch: {
    image: SITE_PHOTOS.catering,
    imageAlt: "Lunch catering platters",
  },
  dinner: {
    image: SITE_PHOTOS.foodDinner,
    imageAlt: "Homestyle dinner plate",
  },
  "dine-in": {
    image: SITE_PHOTOS.welcome,
    imageAlt: "Welcoming dine-in area",
  },
  takeout: {
    image: SITE_PHOTOS.foodFishTray,
    imageAlt: "Takeout favourites",
  },
};

async function main() {
  await mongoose.connect(MONGODB_URI);

  for (const [slug, data] of Object.entries(IMAGE_UPDATES)) {
    const result = await Service.updateOne({ slug }, { $set: data });
    console.log(`${slug}: ${result.modifiedCount ? "updated" : "not found or unchanged"}`);
  }

  await mongoose.disconnect();
  console.log("Service images updated.");
}

main().catch(console.error);
