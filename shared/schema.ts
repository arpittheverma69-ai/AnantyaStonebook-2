import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Gemstone Inventory Table
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stoneId: text("stone_id").notNull().unique(),
  type: text("type").notNull(), // Blue Sapphire, Ruby, Emerald, etc.
  carat: decimal("carat", { precision: 10, scale: 2 }).notNull(),
  origin: text("origin").notNull(), // Jaipur, Surat, Sri Lanka, etc.
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  certified: boolean("certified").default(false),
  certificateLab: text("certificate_lab"), // IGI, IIGJ, GJEPC
  certificateFile: text("certificate_file"), // File path/URL
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("In Stock"), // In Stock, Sold, Reserved
  packageType: text("package_type"), // Velvet, Leatherette
  notes: text("notes"),
  tags: text("tags").array().default([]), // Premium, Budget, High-Demand
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Clients Table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clientType: text("client_type").notNull(), // Astrologer, Jeweler, Temple
  city: text("city").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  loyaltyLevel: text("loyalty_level").default("Medium"), // High, Medium, Low
  notes: text("notes"),
  tags: text("tags").array().default([]), // Bulk Buyer, Premium, Inactive
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Suppliers Table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(), // Jaipur, Surat, Bangkok, etc.
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  type: text("type").notNull(), // Domestic, International
  gemstoneTypes: text("gemstone_types").array().default([]),
  certificationOptions: text("certification_options"),
  notes: text("notes"),
  tags: text("tags").array().default([]), // Reliable, Delay-prone, High-Quality
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Sales Table
export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: text("sale_id").notNull().unique(),
  date: timestamp("date").notNull(),
  clientId: varchar("client_id").references(() => clients.id),
  stoneId: varchar("stone_id").references(() => inventory.id),
  quantity: integer("quantity").default(1),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 15, scale: 2 }).notNull(),
  invoiceFile: text("invoice_file"), // File path/URL
  paymentStatus: text("payment_status").notNull().default("Unpaid"), // Paid, Partial, Unpaid
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Certification Tracker Table
export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stoneId: varchar("stone_id").references(() => inventory.id),
  lab: text("lab").notNull(), // IGI, IIGJ, GJEPC
  dateSent: timestamp("date_sent"),
  dateReceived: timestamp("date_received"),
  certificateFile: text("certificate_file"), // File path/URL
  status: text("status").notNull().default("Pending"), // Pending, Received
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Consultation Logbook Table
export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").references(() => clients.id),
  date: timestamp("date").notNull(),
  medium: text("medium").notNull(), // In-person, Call, Video
  stonesDiscussed: text("stones_discussed").array().default([]),
  outcome: text("outcome"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Tasks & Reminders Table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  relatedTo: text("related_to"), // client_id, stone_id, supplier_id, cert_id
  relatedType: text("related_type"), // Client, Stone, Supplier, Certification
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("Medium"), // High, Medium, Low
  status: text("status").default("Pending"), // Pending, Done, Delayed
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas
export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Keep the existing users table for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
