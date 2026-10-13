import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ShopProduct from "@/models/ShopProduct";

export async function GET() {
  try {
    await connectDB();
    const products = await ShopProduct.find({
      isAvailable: true,
      isArchived: false,
    })
      .sort({ displayOrder: 1 })
      .lean();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
