import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const healthProviders = pgTable("health_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  rating: integer("rating").notNull().default(0), // Rating out of 5 (stored as integer * 10 for decimal precision)
  reviewCount: integer("review_count").notNull().default(0),
  insuranceAccepted: text("insurance_accepted").array().notNull().default([]),
  availability: text("availability").notNull().default("Available"),
  experienceYears: integer("experience_years").notNull().default(0),
  distance: text("distance").notNull().default("0 miles"),
  isAcceptingNewPatients: boolean("is_accepting_new_patients").notNull().default(true),
});

export const healthInquiries = pgTable("health_inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  concern: text("concern").notNull(),
  symptoms: text("symptoms").array().notNull().default([]),
  severity: integer("severity"), // 1-10 scale
  timePattern: text("time_pattern"),
  associatedSymptoms: text("associated_symptoms").array().notNull().default([]),
  response: text("response"),
  isEmergency: boolean("is_emergency").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const healthDocuments = pgTable("health_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  category: text("category").notNull(), // 'lab-results', 'imaging', 'records', 'other'
  description: text("description"),
  filePath: text("file_path").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHealthProviderSchema = createInsertSchema(healthProviders).omit({
  id: true,
});

export const insertHealthInquirySchema = createInsertSchema(healthInquiries).omit({
  id: true,
  createdAt: true,
});

export const insertHealthDocumentSchema = createInsertSchema(healthDocuments).omit({
  id: true,
  uploadDate: true,
});

export const healthInquirySearchSchema = z.object({
  concern: z.string().min(1, "Please describe your health concern"),
  severity: z.number().min(1).max(10).optional(),
  timePattern: z.string().optional(),
  associatedSymptoms: z.array(z.string()).optional(),
});

export const providerSearchSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
  insurance: z.string().optional(),
  acceptingNewPatients: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHealthProvider = z.infer<typeof insertHealthProviderSchema>;
export type HealthProvider = typeof healthProviders.$inferSelect;

export type InsertHealthInquiry = z.infer<typeof insertHealthInquirySchema>;
export type HealthInquiry = typeof healthInquiries.$inferSelect;

export type InsertHealthDocument = z.infer<typeof insertHealthDocumentSchema>;
export type HealthDocument = typeof healthDocuments.$inferSelect;

export type HealthInquirySearch = z.infer<typeof healthInquirySearchSchema>;
export type ProviderSearch = z.infer<typeof providerSearchSchema>;
