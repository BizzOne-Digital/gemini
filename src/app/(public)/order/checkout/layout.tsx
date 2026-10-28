import { requireNativeOnlineOrdering } from "@/lib/require-native-ordering";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireNativeOnlineOrdering();
  return children;
}
