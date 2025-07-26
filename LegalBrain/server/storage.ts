import {
  users,
  firReports,
  chatLogs,
  caseStatus,
  auditLogs,
  type User,
  type UpsertUser,
  type FIRReport,
  type InsertFIR,
  type ChatLog,
  type InsertChatLog,
  type CaseStatus,
  type InsertCaseStatus,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count } from "drizzle-orm";

// AES-256 Encryption Utility
export class EncryptionService {
  private static algorithm = 'aes-256-cbc';
  private static secretKey = process.env.ENCRYPTION_KEY || 'default-32-char-secret-key-change-me!';

  static encrypt(text: string): string {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const crypto = require('crypto');
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // FIR operations
  createFIR(fir: InsertFIR): Promise<FIRReport>;
  getFIRsByUser(userId: string): Promise<FIRReport[]>;
  getFIRById(id: string): Promise<FIRReport | undefined>;
  updateFIRStatus(id: string, status: string, updates?: Partial<FIRReport>): Promise<FIRReport>;
  getAllFIRs(limit?: number): Promise<FIRReport[]>;

  // Chat operations
  createChatLog(chatLog: InsertChatLog): Promise<ChatLog>;
  getChatHistory(userId: string, limit?: number): Promise<ChatLog[]>;

  // Case operations
  createCaseStatus(caseData: InsertCaseStatus): Promise<CaseStatus>;
  getCasesByUser(userId: string): Promise<CaseStatus[]>;
  getCaseById(id: string): Promise<CaseStatus | undefined>;
  updateCaseStatus(id: string, updates: Partial<CaseStatus>): Promise<CaseStatus>;

  // Audit operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // Statistics
  getStats(): Promise<{
    totalUsers: number;
    totalFIRs: number;
    totalChatSessions: number;
    pendingFIRs: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createFIR(firData: InsertFIR): Promise<FIRReport> {
    // Generate FIR number
    const year = new Date().getFullYear();
    const count = await db.select({ count: count() }).from(firReports);
    const firNumber = `FIR/${year}/${String(count[0].count + 1).padStart(6, '0')}`;

    // Encrypt sensitive data before storage
    const encryptedDescription = EncryptionService.encrypt(firData.description || '');
    const encryptedAddress = firData.address ? EncryptionService.encrypt(firData.address) : null;

    const [fir] = await db
      .insert(firReports)
      .values({
        ...firData,
        firNumber,
        description: encryptedDescription,
        address: encryptedAddress,
      })
      .returning();
    
    // Decrypt for return (but keep encrypted in DB)
    return {
      ...fir,
      description: firData.description || '',
      address: firData.address || null,
    };
  }

  async getFIRsByUser(userId: string): Promise<FIRReport[]> {
    return await db
      .select()
      .from(firReports)
      .where(eq(firReports.userId, userId))
      .orderBy(desc(firReports.createdAt));
  }

  async getFIRById(id: string): Promise<FIRReport | undefined> {
    const [fir] = await db.select().from(firReports).where(eq(firReports.id, id));
    return fir;
  }

  async updateFIRStatus(id: string, status: string, updates?: Partial<FIRReport>): Promise<FIRReport> {
    const [fir] = await db
      .update(firReports)
      .set({
        status,
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(firReports.id, id))
      .returning();
    return fir;
  }

  async getAllFIRs(limit = 50): Promise<FIRReport[]> {
    return await db
      .select()
      .from(firReports)
      .orderBy(desc(firReports.createdAt))
      .limit(limit);
  }

  async createChatLog(chatLogData: InsertChatLog): Promise<ChatLog> {
    const [chatLog] = await db
      .insert(chatLogs)
      .values(chatLogData)
      .returning();
    return chatLog;
  }

  async getChatHistory(userId: string, limit = 50): Promise<ChatLog[]> {
    return await db
      .select()
      .from(chatLogs)
      .where(eq(chatLogs.userId, userId))
      .orderBy(desc(chatLogs.createdAt))
      .limit(limit);
  }

  async createCaseStatus(caseData: InsertCaseStatus): Promise<CaseStatus> {
    const [caseRecord] = await db
      .insert(caseStatus)
      .values(caseData)
      .returning();
    return caseRecord;
  }

  async getCasesByUser(userId: string): Promise<CaseStatus[]> {
    return await db
      .select()
      .from(caseStatus)
      .where(eq(caseStatus.userId, userId))
      .orderBy(desc(caseStatus.createdAt));
  }

  async getCaseById(id: string): Promise<CaseStatus | undefined> {
    const [caseRecord] = await db.select().from(caseStatus).where(eq(caseStatus.id, id));
    return caseRecord;
  }

  async updateCaseStatus(id: string, updates: Partial<CaseStatus>): Promise<CaseStatus> {
    const [caseRecord] = await db
      .update(caseStatus)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(caseStatus.id, id))
      .returning();
    return caseRecord;
  }

  async createAuditLog(auditLogData: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(auditLogData)
      .returning();
    return auditLog;
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalFIRs: number;
    totalChatSessions: number;
    pendingFIRs: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [firCount] = await db.select({ count: count() }).from(firReports);
    const [chatCount] = await db.select({ count: count() }).from(chatLogs);
    const [pendingCount] = await db
      .select({ count: count() })
      .from(firReports)
      .where(eq(firReports.status, "pending"));

    return {
      totalUsers: userCount.count,
      totalFIRs: firCount.count,
      totalChatSessions: chatCount.count,
      pendingFIRs: pendingCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
