import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
});

// Event Types
export const eventTypeEnum = pgEnum("event_type", [
  "wedding",
  "corporate",
  "private_party",
  "non_profit",
]);

// Event Status
export const eventStatusEnum = pgEnum("event_status", [
  "inquiry",
  "follow_up",
  "icm",
  "proposal",
  "pay_retainer",
  "pcm",
  "2cm",
  "fcm",
  "gdg",
  "review",
  "completed",
  "cancelled",
]);

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  eventType: text("event_type").notNull(),
  services: text("services").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  guestCount: integer("guest_count").notNull(),
  minBudget: real("min_budget").notNull(),
  maxBudget: real("max_budget").notNull(),
  status: text("status").notNull().default("inquiry"),
  referralSource: text("referral_source"),
  additionalDetails: text("additional_details"),
  musicPreferences: text("music_preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create the base schema
const baseInsertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Extend with transformations for date fields
export const insertEventSchema = baseInsertEventSchema.extend({
  date: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  startTime: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  endTime: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

// Contacts
export const contactTypeEnum = pgEnum("contact_type", [
  "client",
  "lead_planner",
  "team_member",
  "vendor",
]);

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Event Contacts (Direct contact storage)
export const eventContacts = pgTable("event_contacts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  contactType: text("contact_type").notNull(),
  role: text("role").notNull(),
  company: text("company"),
  website: text("website"),
});

export const insertEventContactSchema = createInsertSchema(eventContacts).omit({
  id: true,
});

// Relations removed to ensure clean, flat data structures

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type EventContact = typeof eventContacts.$inferSelect;
export type InsertEventContact = z.infer<typeof insertEventContactSchema>;
