import { requireNativeOnlineOrdering } from "@/lib/require-native-ordering";

export default async function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireNativeOnlineOrdering();
  return children;
}
