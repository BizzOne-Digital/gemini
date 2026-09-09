import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  performedBy: string;
  performedByEmail: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    details: Schema.Types.Mixed,
    performedBy: { type: String, required: true },
    performedByEmail: { type: String, required: true },
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ entity: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
