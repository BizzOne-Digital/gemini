import { redirect } from "next/navigation";

export { generateMetadata } from "../page";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function BreakfastMenuPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = new URLSearchParams({ group: "breakfast" });
  if (params.category) q.set("category", params.category);
  redirect(`/menu?${q.toString()}`);
}
