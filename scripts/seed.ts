/**
 * PURPOSE: Seed MongoDB with a demo tenant, users, categories, products, orders, and customers.
 * Run: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { Tenant } from "../models/Tenant";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";

async function main() {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/nexus-commerce";
  await mongoose.connect(uri);
  console.log("Connected to", uri);

  await Promise.all([
    Order.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Customer.deleteMany({}),
    User.deleteMany({}),
    Tenant.deleteMany({}),
  ]);

  const tenant = await Tenant.create({
    name: "Demo Electronics Store",
    slug: "demo-store",
    currency: "USD",
    timezone: "America/New_York",
    plan: "pro",
    description: "Demo data for Nexus Commerce",
    contactEmail: "hello@demo-store.test",
  });

  const passwordHash = await bcrypt.hash("admin123", 12);
  const cashierHash = await bcrypt.hash("cashier123", 12);
  const customerHash = await bcrypt.hash("customer123", 12);

  await User.create({
    email: "admin@demo.com",
    passwordHash,
    name: "Demo Owner",
    role: "STORE_OWNER",
    tenantId: tenant._id,
  });

  await User.create({
    email: "cashier@demo.com",
    passwordHash: cashierHash,
    name: "Demo Cashier",
    role: "CASHIER",
    tenantId: tenant._id,
  });

  await User.create({
    email: "customer@demo.com",
    passwordHash: customerHash,
    name: "Demo Customer",
    role: "CUSTOMER",
    tenantId: tenant._id,
  });

  const catNames = ["Electronics", "Accessories", "Clothing", "Food", "Books"];
  const categories = await Category.insertMany(
    catNames.map((name) => ({
      name,
      slug: name.toLowerCase(),
      tenantId: tenant._id,
      productCount: 0,
    }))
  );

  const productSeeds: {
    name: string;
    slug: string;
    price: number;
    stock: number;
    sku: string;
    categoryIdx: number;
  }[] = [];

  for (let i = 1; i <= 20; i++) {
    const c = categories[i % categories.length];
    productSeeds.push({
      name: `Product ${i} — ${c.name}`,
      slug: `product-${i}`,
      price: 9.99 + i * 3.5,
      stock: 5 + (i % 15),
      sku: `SKU-${1000 + i}`,
      categoryIdx: i % categories.length,
    });
  }

  const products = await Product.insertMany(
    productSeeds.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: `Description for ${p.name}`,
      price: p.price,
      compareAtPrice: p.price + 10,
      stock: p.stock,
      images: ["https://placehold.co/400x400/png"],
      categoryId: categories[p.categoryIdx]._id,
      tenantId: tenant._id,
      isActive: true,
      sku: p.sku,
    }))
  );

  const customers = await Customer.insertMany(
    Array.from({ length: 15 }).map((_, i) => ({
      email: `customer${i + 1}@demo.com`,
      name: `Customer ${i + 1}`,
      phone: `555-01${String(i).padStart(2, "0")}`,
      tenantId: tenant._id,
      addresses: [
        {
          line1: `${100 + i} Main St`,
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
        },
      ],
      totalOrders: 0,
      totalSpent: 0,
    }))
  );

  const statuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const;

  for (let i = 0; i < 10; i++) {
    const p1 = products[i % products.length];
    const p2 = products[(i + 3) % products.length];
    const items = [
      {
        productId: p1._id,
        name: p1.name,
        price: p1.price,
        quantity: 1 + (i % 3),
        image: p1.images[0],
      },
      {
        productId: p2._id,
        name: p2.name,
        price: p2.price,
        quantity: 1,
        image: p2.images[0],
      },
    ];
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shipping = 5.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    const cust = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    await Order.create({
      orderNumber: `NX-${nanoid(8).toUpperCase()}`,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status,
      customer: { name: cust.name, email: cust.email, phone: cust.phone },
      customerId: cust._id,
      shippingAddress: cust.addresses[0],
      channel: i % 3 === 0 ? "POS" : "ONLINE",
      tenantId: tenant._id,
      statusHistory: [{ status, at: new Date() }],
    });
  }

  console.log("Seed complete. Tenant slug: demo-store");
  console.log("Owner: admin@demo.com / admin123");
  console.log("Cashier: cashier@demo.com / cashier123");
  console.log("Customer: customer@demo.com / customer123");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
