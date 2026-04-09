// PURPOSE: Mongoose schema for audit trail of stock level changes.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const InventoryLogSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productName: { type: String, required: true },
    change: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  },
  { timestamps: true }
);

InventoryLogSchema.index({ tenantId: 1, createdAt: -1 });

export type InventoryLogDocument = InferSchemaType<typeof InventoryLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InventoryLog: Model<InventoryLogDocument> =
  mongoose.models.InventoryLog ??
  mongoose.model<InventoryLogDocument>("InventoryLog", InventoryLogSchema);
