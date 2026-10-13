import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const items = await MenuItem.find({ isArchived: false }).populate("category");

    const data = items.map((item) => ({
      Category: (item.category as { name?: string })?.name || "",
      Subcategory: item.subcategory || "",
      "Item Name": item.name,
      Slug: item.slug,
      Description: item.description || "",
      Price: item.price,
      "Sale Price": item.salePrice || "",
      Currency: item.currency,
      "Image URL": item.image || "",
      "Dietary Tags": item.dietaryTags.join(", "),
      Allergens: item.allergens.join(", "),
      Available: item.isAvailable,
      Featured: item.isFeatured,
      Popular: item.isPopular,
      "Display Order": item.displayOrder,
      SKU: item.sku || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="homestyle-menu-${Date.now()}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
