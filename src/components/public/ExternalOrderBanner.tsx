import type { SiteSettingsData } from "@/types/site";
import { externalOrderUrl } from "@/lib/external-ordering";
import { Button } from "@/components/ui/Button";

type Props = {
  settings: Pick<
    SiteSettingsData,
    "onlineOrderingEnabled" | "orderOnlineUrl"
  >;
  className?: string;
};

export function ExternalOrderBanner({ settings, className }: Props) {
  if (settings.onlineOrderingEnabled) return null;

  const href = externalOrderUrl(settings);

  return (
    <div
      className={
        className ??
        "mb-8 rounded-2xl border border-heritage-green/20 bg-soft-oat/60 p-5 sm:p-6"
      }
    >
      <p className="font-display text-lg text-espresso">Order online</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Place pickup or delivery orders through our secure ordering partner
        (modifiers and options available there).
      </p>
      <Button href={href} external className="mt-4">
        Order pickup or delivery
      </Button>
    </div>
  );
}
