// PURPOSE: Mongoose schema for storefront customer profiles per tenant.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AddressSchema = new Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, createdAt: -1 });

export type CustomerDocument = InferSchemaType<typeof CustomerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Customer: Model<CustomerDocument> =
  mongoose.models.Customer ?? mongoose.model<CustomerDocument>("Customer", CustomerSchema);
