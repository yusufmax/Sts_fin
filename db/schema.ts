import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("cms_pages", {
  slug: text("slug").primaryKey(),
  data: text("data").notNull(),
  status: text("status").notNull().default("published"),
  updatedAt: text("updated_at").notNull(),
});

export const settings = sqliteTable("cms_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const media = sqliteTable("cms_media", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  bytes: integer("bytes").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export const submissions = sqliteTable("cms_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  interest: text("interest").notNull(),
  message: text("message").notNull(),
  locale: text("locale").notNull(),
  deliveryStatus: text("delivery_status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const rateLimits = sqliteTable("cms_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(),
});

export const articles = sqliteTable("cms_articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  data: text("data").notNull(),
  status: text("status").notNull().default("draft"),
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull(),
});
