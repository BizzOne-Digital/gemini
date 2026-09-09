import "dotenv/config";
import mongoose from "mongoose";
import Service from "../src/models/Service";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

const IMAGE_UPDATES: Record<string, { image: string; imageAlt: string }> = {
  bakery: {
    image: "/images/service-bakery.png",
    imageAlt: "Homemade chocolate cake and bakery desserts at Homestyle Diner",
  },
  catering: {
    image: "/images/service-catering.jpg",
    imageAlt: "Catering spread with fresh salads and appetizers",
  },
  "group-dining": {
    image: "/images/service-group-dining.jpg",
    imageAlt: "Group dining and catering spread at Homestyle Diner",
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
