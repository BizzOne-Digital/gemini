import dotenv from "dotenv";
import mongoose from "mongoose";
import Navigation from "../src/models/Navigation";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";
  await mongoose.connect(uri);
  const nav = await Navigation.findOne();
  if (nav) {
    nav.links = nav.links
      .filter((l) => l.href !== "/testimonials")
      .map((l) => {
        if (l.href === "/booking") l.displayOrder = 4;
        if (l.href === "/contact") l.displayOrder = 5;
        return l;
      });
    await nav.save();
    console.log("Testimonials removed from navigation.");
  }
  await mongoose.disconnect();
}

main().catch(console.error);
