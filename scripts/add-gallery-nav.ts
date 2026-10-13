import "./load-env";
import mongoose from "mongoose";
import Navigation from "../src/models/Navigation";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const nav = await Navigation.findOne();
  if (!nav) {
    console.log("No navigation document found.");
    await mongoose.disconnect();
    return;
  }

  const hasGallery = nav.links.some((l) => l.href === "/gallery");
  if (!hasGallery) {
    nav.links.push({
      label: "Gallery",
      href: "/gallery",
      displayOrder: 3,
      isVisible: true,
      openInNewTab: false,
    });
  }

  const order: Record<string, number> = {
    "/": 0,
    "/about": 1,
    "/menu": 2,
    "/gallery": 3,
    "/services": 4,
    "/booking": 5,
    "/contact": 6,
  };

  nav.links = nav.links
    .map((link) => ({
      label: link.label,
      href: link.href,
      displayOrder: order[link.href] ?? link.displayOrder + 10,
      isVisible: link.isVisible,
      openInNewTab: link.openInNewTab,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  await nav.save();
  console.log("Gallery link added to navigation.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
