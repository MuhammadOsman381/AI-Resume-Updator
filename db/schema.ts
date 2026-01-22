import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cvs = pgTable("cvs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  cvJson: jsonb("cv_json").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "applied",
]);

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  emails: jsonb("emails").$type<string[]>().notNull().default([]),
  status: jobStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});