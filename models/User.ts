// PURPOSE: Mongoose schema for authenticated users including staff and customers.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "STORE_OWNER", "CASHIER", "CUSTOMER"],
      required: true,
    },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ tenantId: 1, role: 1 });

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);
