import "./load-env";
import mongoose from "mongoose";
import { PageContent, Service } from "../src/models";
import { SITE_PHOTOS } from "../src/lib/site-photos";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";

async function upsertSection(
  pageSlug: string,
  key: string,
  patch: Record<string, unknown>
) {
  const page = await PageContent.findOne({ pageSlug });
  if (!page) {
    console.log(`  skip ${pageSlug} (no page document)`);
    return;
  }

  const sections = [...(page.sections || [])];
  const idx = sections.findIndex((s) => s.key === key);
  if (idx >= 0) {
    sections[idx] = { ...sections[idx], ...patch };
  } else {
    sections.push({
      key,
      isVisible: true,
      displayOrder: sections.length,
      ...patch,
    });
  }

  page.sections = sections;
  await page.save();
  console.log(`  ${pageSlug} → ${key} image updated`);
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  await upsertSection("home", "hero", {
    image: SITE_PHOTOS.hero,
    imageAlt: "Hearty homestyle breakfast with pancakes, eggs, bacon, and coffee at Homestyle Diner",
  });
  await upsertSection("home", "welcome", {
    image: SITE_PHOTOS.welcome,
    imageAlt: "Homestyle Diner entrance with daily specials chalkboard",
  });
  await upsertSection("home", "bakery", {
    image: SITE_PHOTOS.bakery,
    imageAlt: "Homemade pie with whipped cream and chocolate drizzle",
  });

  await upsertSection("about", "intro", {
    image: SITE_PHOTOS.about,
    imageAlt: "Homestyle Diner neon sign and dining room feature wall",
  });

  const serviceImages: Record<string, { image: string; imageAlt: string }> = {
    breakfast: {
      image: SITE_PHOTOS.foodFishChips,
      imageAlt: "Classic fish and chips at Homestyle Diner",
    },
    lunch: {
      image: SITE_PHOTOS.catering,
      imageAlt: "Catering sandwich and wrap platters",
    },
    dinner: {
      image: SITE_PHOTOS.foodDinner,
      imageAlt: "Breaded dinner plate with sweet potato fries",
    },
    bakery: {
      image: SITE_PHOTOS.bakery,
      imageAlt: "Homemade pie and bakery desserts",
    },
    "bakery-desserts": {
      image: SITE_PHOTOS.bakeryAlt,
      imageAlt: "Decorated cheesecake from Homestyle Diner bakery",
    },
    "dine-in": {
      image: SITE_PHOTOS.welcome,
      imageAlt: "Welcoming dine-in area at Homestyle Diner",
    },
    takeout: {
      image: SITE_PHOTOS.foodFishTray,
      imageAlt: "Takeout favourites from Homestyle Diner",
    },
    catering: {
      image: SITE_PHOTOS.catering,
      imageAlt: "Catering platters for events and offices",
    },
    "group-dining": {
      image: SITE_PHOTOS.groupDining,
      imageAlt: "Group dining space at Homestyle Diner Waterloo",
    },
  };

  for (const [slug, data] of Object.entries(serviceImages)) {
    const result = await Service.updateOne({ slug }, { $set: data });
    console.log(
      `  service ${slug}: ${result.matchedCount ? "updated" : "not found"}`
    );
  }

  await mongoose.disconnect();
  console.log("Site photos applied to database.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
