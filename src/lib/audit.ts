import { connectDB } from "./db";
import AuditLog from "@/models/AuditLog";

export async function logAudit({
  action,
  entity,
  entityId,
  details,
  performedBy,
  performedByEmail,
  ipAddress,
}: {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  performedBy: string;
  performedByEmail: string;
  ipAddress?: string;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      action,
      entity,
      entityId,
      details,
      performedBy,
      performedByEmail,
      ipAddress,
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
