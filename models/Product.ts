// PURPOSE: Mongoose schema for sellable products scoped to a tenant.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    costPerItem: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    weight: { type: Number },
    images: { type: [String], default: [] },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sku: { type: String, required: true },
    barcode: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ProductSchema.index(
  { tenantId: 1, barcode: 1 },
  { unique: true, sparse: true }
);
ProductSchema.index({ tenantId: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ tenantId: 1, categoryId: 1, isActive: 1, createdAt: -1 });

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Product: Model<ProductDocument> =
  mongoose.models.Product ?? mongoose.model<ProductDocument>("Product", ProductSchema);
