import type { TestimonialData } from "@/types/site";

/** Shown on the homepage when fewer than 3 approved featured reviews exist in the CMS. */
export const GOOGLE_REVIEW_FALLBACKS: TestimonialData[] = [
  {
    _id: "google-fallback-1",
    customerName: "Sarah M.",
    rating: 5,
    reviewText:
      "Best breakfast in Waterloo! The portions are generous, everything tastes homemade, and the staff always make you feel welcome.",
    isFeatured: true,
    reviewDate: "2025-11-12T00:00:00.000Z",
    visitType: "dine_in",
  },
  {
    _id: "google-fallback-2",
    customerName: "James T.",
    rating: 5,
    reviewText:
      "We come here for lunch regularly — fresh soups, great sandwiches, and friendly service. A true neighbourhood gem.",
    isFeatured: true,
    reviewDate: "2025-10-03T00:00:00.000Z",
    visitType: "dine_in",
  },
  {
    _id: "google-fallback-3",
    customerName: "Priya K.",
    rating: 5,
    reviewText:
      "The bakery desserts are incredible and the rolled ribs on Friday night are worth the wait. Highly recommend for families.",
    isFeatured: true,
    reviewDate: "2026-01-20T00:00:00.000Z",
    visitType: "dine_in",
  },
];

export function mergeFeaturedReviews(
  fromDb: TestimonialData[],
  limit = 3
): TestimonialData[] {
  const seen = new Set<string>();
  const merged: TestimonialData[] = [];

  for (const t of fromDb) {
    if (merged.length >= limit) break;
    const key = t.reviewText.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
  }

  for (const t of GOOGLE_REVIEW_FALLBACKS) {
    if (merged.length >= limit) break;
    const key = t.reviewText.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
  }

  return merged.slice(0, limit);
}
