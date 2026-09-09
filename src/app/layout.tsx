import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://homestylediner.ca"
  ),
  title: {
    default: "Homestyle Diner | Homemade Comfort Food in Waterloo, ON",
    template: "%s | Homestyle Diner",
  },
  description:
    "Family-owned diner in Waterloo since 1987. Hearty breakfasts, slow-cooked favourites, and freshly baked pies. Dine-in, takeout, catering, and group dining.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  keywords: [
    "Homestyle Diner",
    "Waterloo restaurant",
    "comfort food",
    "breakfast",
    "homemade pies",
    "catering Waterloo",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Homestyle Diner",
    title: "Homestyle Diner | Homemade Comfort Food, Served with Heart.",
    description:
      "Family-owned and operated in Waterloo since 1987. Homemade comfort food, served with heart.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Homestyle Diner",
    description:
      "Homemade comfort food in Waterloo, ON. Family-owned since 1987.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${fraunces.variable} ${manrope.variable} h-full overflow-x-clip antialiased`}
    >
      <body className="flex min-h-full w-full min-w-0 flex-col overflow-x-clip bg-background font-sans text-foreground">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
