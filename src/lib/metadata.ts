import type { Metadata } from "next";
import { getSeoSettings } from "./data";

export async function buildPageMetadata(
  path: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  try {
    const seo = await getSeoSettings();
    const pageSeo = seo.pages?.find((p: { path: string }) => p.path === path);

    const title = pageSeo?.title || fallback.title;
    const description = pageSeo?.description || fallback.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(pageSeo?.ogImage || seo.defaultOgImage
          ? { images: [pageSeo?.ogImage || seo.defaultOgImage] }
          : {}),
      },
      ...(pageSeo?.noIndex ? { robots: { index: false, follow: false } } : {}),
      ...(pageSeo?.canonicalUrl
        ? { alternates: { canonical: pageSeo.canonicalUrl } }
        : {}),
    };
  } catch {
    return {
      title: fallback.title,
      description: fallback.description,
    };
  }
}
