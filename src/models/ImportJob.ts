import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ImportJobStatus = "pending" | "processing" | "completed" | "failed" | "rolled_back";

export interface IImportError {
  row: number;
  field: string;
  message: string;
}

export interface IImportJob extends Document {
  filename: string;
  status: ImportJobStatus;
  mode: "dry_run" | "create" | "update" | "upsert";
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  rowErrors: IImportError[];
  errorReportUrl?: string;
  importedBy: string;
  canRollback: boolean;
  rollbackData?: unknown[];
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImportErrorSchema = new Schema({
  row: Number,
  field: String,
  message: String,
});

const ImportJobSchema = new Schema<IImportJob>(
  {
    filename: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "rolled_back"],
      default: "pending",
    },
    mode: {
      type: String,
      enum: ["dry_run", "create", "update", "upsert"],
      default: "upsert",
    },
    totalRows: { type: Number, default: 0 },
    created: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    rowErrors: [ImportErrorSchema],
    errorReportUrl: String,
    importedBy: String,
    canRollback: { type: Boolean, default: false },
    rollbackData: Schema.Types.Mixed,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

ImportJobSchema.index({ createdAt: -1 });

const ImportJob: Model<IImportJob> =
  mongoose.models.ImportJob || mongoose.model<IImportJob>("ImportJob", ImportJobSchema);

export default ImportJob;
