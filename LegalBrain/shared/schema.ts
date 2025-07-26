import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  index,
  uuid,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("citizen"), // citizen, police, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FIR Reports
export const firReports = pgTable("fir_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firNumber: varchar("fir_number").unique().notNull(),
  crimeType: varchar("crime_type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  incidentDate: timestamp("incident_date").notNull(),
  incidentTime: varchar("incident_time").notNull(),
  ipcSections: jsonb("ipc_sections").$type<string[]>().default([]),
  evidenceUrls: jsonb("evidence_urls").$type<string[]>().default([]),
  status: varchar("status").notNull().default("pending"), // pending, investigating, chargesheet_filed, court_proceedings, disposed
  investigatingOfficer: varchar("investigating_officer"),
  policeStation: varchar("police_station"),
  pdfUrl: varchar("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Logs
export const chatLogs = pgTable("chat_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  language: varchar("language").default("english"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Case Status
export const caseStatus = pgTable("case_status", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  firId: uuid("fir_id").references(() => firReports.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull(),
  court: varchar("court"),
  judge: varchar("judge"),
  hearingDate: timestamp("hearing_date"),
  nextHearing: timestamp("next_hearing"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  module: varchar("module").notNull(), // fir, chat, case, profile
  action: varchar("action").notNull(), // create, read, update, delete
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertFIRSchema = createInsertSchema(firReports).omit({
  id: true,
  firNumber: true,
  status: true,
  investigatingOfficer: true,
  policeStation: true,
  pdfUrl: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFIR = z.infer<typeof insertFIRSchema>;
export type FIRReport = typeof firReports.$inferSelect;

export const insertChatLogSchema = createInsertSchema(chatLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertChatLog = z.infer<typeof insertChatLogSchema>;
export type ChatLog = typeof chatLogs.$inferSelect;

export const insertCaseStatusSchema = createInsertSchema(caseStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCaseStatus = z.infer<typeof insertCaseStatusSchema>;
export type CaseStatus = typeof caseStatus.$inferSelect;

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  firReports: many(firReports),
  chatLogs: many(chatLogs),
  caseStatus: many(caseStatus),
  auditLogs: many(auditLogs),
}));

export const firReportsRelations = relations(firReports, ({ one }) => ({
  user: one(users, {
    fields: [firReports.userId],
    references: [users.id],
  }),
}));

export const chatLogsRelations = relations(chatLogs, ({ one }) => ({
  user: one(users, {
    fields: [chatLogs.userId],
    references: [users.id],
  }),
}));

export const caseStatusRelations = relations(caseStatus, ({ one }) => ({
  user: one(users, {
    fields: [caseStatus.userId],
    references: [users.id],
  }),
  firReport: one(firReports, {
    fields: [caseStatus.firId],
    references: [firReports.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
