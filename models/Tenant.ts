// PURPOSE: Mongoose schema for multi-tenant store configuration and branding.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TenantSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" },
    plan: { type: String, default: "starter" },
    description: { type: String },
    contactEmail: { type: String },
  },
  { timestamps: true }
);

export type TenantDocument = InferSchemaType<typeof TenantSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Tenant: Model<TenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<TenantDocument>("Tenant", TenantSchema);
