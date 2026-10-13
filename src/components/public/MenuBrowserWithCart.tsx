"use client";

import { toast } from "sonner";
import { MenuBrowser } from "@/components/public/MenuBrowser";
import { useCart } from "@/components/providers/CartProvider";
import type { MenuCategoryData, MenuItemData } from "@/types/site";
import type { MenuGroupId } from "@/lib/menu-groups";

type Props = {
  categories: MenuCategoryData[];
  items: MenuItemData[];
  initialGroup?: MenuGroupId;
  initialCategory?: string;
  onlineOrderingEnabled: boolean;
};

export function MenuBrowserWithCart(props: Props) {
  const { addLine } = useCart();

  function handleAdd(item: MenuItemData) {
    addLine({
      name: item.name,
      unitPrice: item.salePrice ?? item.price,
      menuItemId: item._id,
      source: "menu",
    });
    toast.success(`${item.name} added to your order`);
  }

  return (
    <MenuBrowser
      {...props}
      onAddToCart={handleAdd}
    />
  );
}
