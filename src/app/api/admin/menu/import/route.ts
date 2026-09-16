import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import * as XLSX from "xlsx";
import MenuCategory from "@/models/MenuCategory";
import MenuItem from "@/models/MenuItem";
import ImportJob from "@/models/ImportJob";
import { slugify, normalizeItemName } from "@/lib/utils";
import {
  pickImportField,
  SQUARE_CATEGORY_KEYS,
  SQUARE_DESCRIPTION_KEYS,
  SQUARE_ITEM_NAME_KEYS,
  SQUARE_PRICE_KEYS,
} from "@/lib/menu-import";
import { logAudit } from "@/lib/audit";

interface ImportRow {
  Category?: string;
  Subcategory?: string;
  "Item Name"?: string;
  Slug?: string;
  Description?: string;
  Price?: number | string;
  "Sale Price"?: number | string;
  Currency?: string;
  "Image URL"?: string;
  "Dietary Tags"?: string;
  Allergens?: string;
  Available?: string | boolean;
  Featured?: string | boolean;
  Popular?: string | boolean;
  "Display Order"?: number | string;
  SKU?: string;
  Variants?: string;
  "Add-ons"?: string;
}

function parseBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    return ["true", "yes", "1", "y"].includes(val.toLowerCase());
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = (formData.get("mode") as string) || "upsert";
    const dryRun = formData.get("dryRun") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ImportRow>(sheet);

    await connectDB();

    const job = await ImportJob.create({
      filename: file.name,
      status: "processing",
      mode: dryRun ? "dry_run" : (mode as "create" | "update" | "upsert"),
      totalRows: rows.length,
      importedBy: session.user.email,
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: { row: number; field: string; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const rowNum = i + 2;

      try {
        const itemName = pickImportField(row, SQUARE_ITEM_NAME_KEYS);
        const categoryName = pickImportField(row, SQUARE_CATEGORY_KEYS);
        const priceRaw = pickImportField(row, SQUARE_PRICE_KEYS);

        if (!itemName || !categoryName) {
          errors.push({ row: rowNum, field: "Item Name/Category", message: "Required fields missing" });
          skipped++;
          continue;
        }

        const price = parseFloat(String(priceRaw || "0"));
        if (isNaN(price) || price < 0) {
          errors.push({ row: rowNum, field: "Price", message: "Invalid price" });
          skipped++;
          continue;
        }

        if (dryRun) {
          created++;
          continue;
        }

        let category = await MenuCategory.findOne({
          name: { $regex: new RegExp(`^${categoryName}$`, "i") },
        });

        if (!category) {
          category = await MenuCategory.create({
            name: categoryName,
            slug: slugify(categoryName),
            displayOrder: i,
            isActive: true,
          });
        }

        const slug =
          (typeof row.Slug === "string" && row.Slug) || slugify(itemName);
        const normalizedName = normalizeItemName(itemName);
        const description =
          pickImportField(row, SQUARE_DESCRIPTION_KEYS) ||
          (typeof row.Description === "string" ? row.Description : undefined);

        const itemData = {
          name: itemName,
          slug,
          normalizedName,
          sku: typeof row.SKU === "string" ? row.SKU : undefined,
          description,
          price,
          salePrice: row["Sale Price"] ? parseFloat(String(row["Sale Price"])) : undefined,
          currency: typeof row.Currency === "string" ? row.Currency : "CAD",
          category: category._id,
          subcategory:
            typeof row.Subcategory === "string" ? row.Subcategory : undefined,
          image: typeof row["Image URL"] === "string" ? row["Image URL"] : undefined,
          dietaryTags:
            typeof row["Dietary Tags"] === "string"
              ? row["Dietary Tags"].split(",").map((t: string) => t.trim()).filter(Boolean)
              : [],
          allergens:
            typeof row.Allergens === "string"
              ? row.Allergens.split(",").map((t: string) => t.trim()).filter(Boolean)
              : [],
          isAvailable: row.Available !== undefined ? parseBool(row.Available) : true,
          isFeatured: parseBool(row.Featured),
          isPopular: parseBool(row.Popular),
          displayOrder: parseInt(String(row["Display Order"] || i), 10),
        };

        const existing = await MenuItem.findOne({
          $or: [{ slug }, { normalizedName }, ...(row.SKU ? [{ sku: row.SKU }] : [])],
        });

        if (existing && mode === "create") {
          skipped++;
          continue;
        }

        if (existing && (mode === "update" || mode === "upsert")) {
          await MenuItem.findByIdAndUpdate(existing._id, itemData);
          updated++;
        } else if (!existing) {
          await MenuItem.create(itemData);
          created++;
        } else {
          skipped++;
        }
      } catch (e) {
        errors.push({
          row: rowNum,
          field: "general",
          message: e instanceof Error ? e.message : "Unknown error",
        });
        skipped++;
      }
    }

    job.status = "completed";
    job.created = created;
    job.updated = updated;
    job.skipped = skipped;
    job.rowErrors = errors;
    job.completedAt = new Date();
    job.canRollback = !dryRun;
    await job.save();

    await logAudit({
      action: "import",
      entity: "menu",
      entityId: job._id.toString(),
      details: { created, updated, skipped, dryRun },
      performedBy: session.user.id,
      performedByEmail: session.user.email,
    });

    return NextResponse.json({
      success: true,
      jobId: job._id,
      created,
      updated,
      skipped,
      errors,
      dryRun,
    });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const jobs = await ImportJob.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch import history" }, { status: 500 });
  }
}
