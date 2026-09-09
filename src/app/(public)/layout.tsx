import {
  getPublicSiteSettings,
  getPublicNavigation,
} from "@/lib/site-data";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { MobileActionBar } from "@/components/public/MobileActionBar";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageTransition } from "@/components/providers/PageTransition";
import { AnimatedPage } from "@/components/providers/AnimatedPage";
import { StructuredData } from "@/components/seo/StructuredData";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navigation] = await Promise.all([
    getPublicSiteSettings(),
    getPublicNavigation(),
  ]);

  return (
    <SmoothScroll>
      <div className="flex min-h-full w-full min-w-0 flex-col overflow-x-clip">
        <StructuredData settings={settings} />
        <PageTransition />
        <Header navigation={navigation} settings={settings} />
        <main className="flex-1 w-full min-w-0 pb-[var(--mobile-bar-height)] md:pb-0">
          <AnimatedPage>{children}</AnimatedPage>
        </main>
        <Footer navigation={navigation} settings={settings} />
        <MobileActionBar settings={settings} />
      </div>
    </SmoothScroll>
  );
}
