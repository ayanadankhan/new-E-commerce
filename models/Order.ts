// PURPOSE: Mongoose schema for customer orders from online checkout or POS.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

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

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      required: true,
    },
    at: { type: Date, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    shippingAddress: { type: AddressSchema, required: true },
    channel: { type: String, enum: ["ONLINE", "POS"], required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ tenantId: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, "customer.email": 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof OrderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>("Order", OrderSchema);
