// PURPOSE: Mongoose schema for product categories per tenant.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ tenantId: 1, name: 1 });

export type CategoryDocument = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Category: Model<CategoryDocument> =
  mongoose.models.Category ?? mongoose.model<CategoryDocument>("Category", CategorySchema);
