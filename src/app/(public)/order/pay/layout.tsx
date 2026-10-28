import { requireNativeOnlineOrdering } from "@/lib/require-native-ordering";

export default async function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireNativeOnlineOrdering();
  return children;
}
