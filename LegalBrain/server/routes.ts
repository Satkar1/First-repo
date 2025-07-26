import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertFIRSchema, insertChatLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // FIR routes
  app.post('/api/fir', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const firData = insertFIRSchema.parse({ ...req.body, userId });
      
      const fir = await storage.createFIR(firData);
      
      // Log audit trail
      await storage.createAuditLog({
        userId,
        module: "fir",
        action: "create",
        details: { firId: fir.id, firNumber: fir.firNumber },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json(fir);
    } catch (error) {
      console.error("Error creating FIR:", error);
      res.status(400).json({ message: "Failed to create FIR" });
    }
  });

  app.get('/api/fir/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const firs = await storage.getFIRsByUser(userId);
      res.json(firs);
    } catch (error) {
      console.error("Error fetching user FIRs:", error);
      res.status(500).json({ message: "Failed to fetch FIRs" });
    }
  });

  app.get('/api/fir/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'police' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const firs = await storage.getAllFIRs();
      res.json(firs);
    } catch (error) {
      console.error("Error fetching all FIRs:", error);
      res.status(500).json({ message: "Failed to fetch FIRs" });
    }
  });

  app.put('/api/fir/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'police' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const { status, investigatingOfficer, policeStation } = req.body;
      
      const fir = await storage.updateFIRStatus(id, status, {
        investigatingOfficer,
        policeStation,
      });

      // Log audit trail
      await storage.createAuditLog({
        userId: req.user.claims.sub,
        module: "fir",
        action: "update",
        details: { firId: id, newStatus: status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(fir);
    } catch (error) {
      console.error("Error updating FIR status:", error);
      res.status(400).json({ message: "Failed to update FIR status" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, language = "english" } = req.body;
      
      // Generate AI response
      const response = generateLegalResponse(query);
      
      const chatLog = await storage.createChatLog({
        userId,
        query,
        response,
        language,
      });

      // Log audit trail
      await storage.createAuditLog({
        userId,
        module: "chat",
        action: "create",
        details: { chatId: chatLog.id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ response, chatId: chatLog.id });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Case status routes
  app.get('/api/cases/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cases = await storage.getCasesByUser(userId);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching user cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Statistics routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Audit logs route
  app.get('/api/audit', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // AI IPC section suggestion
  app.post('/api/ai/ipc-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { description, crimeType } = req.body;
      const suggestions = generateIPCSuggestions(description, crimeType);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating IPC suggestions:", error);
      res.status(500).json({ message: "Failed to generate IPC suggestions" });
    }
  });

  // Enhanced chatbot endpoint with AI processing
  app.post('/api/chatbot', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, language = "english" } = req.body;
      
      // Generate AI response using enhanced processing
      const response = await generateEnhancedLegalResponse(query, language);
      
      const chatLog = await storage.createChatLog({
        userId,
        query,
        response: response.text,
        language,
      });

      // Log audit trail
      await storage.createAuditLog({
        userId,
        module: "chat",
        action: "create",
        details: { chatId: chatLog.id, language },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ 
        response: response.text,
        confidence: response.confidence,
        suggestedActions: response.suggestedActions,
        relatedSections: response.relatedSections,
        nlpInsights: response.nlpInsights,
        chatId: chatLog.id 
      });
    } catch (error) {
      console.error("Error processing chatbot request:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  // Generate FIR with PDF creation and encryption
  app.post('/api/fir/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const firData = insertFIRSchema.parse({ ...req.body, userId });
      
      // Generate IPC suggestions
      const ipcSuggestions = generateIPCSuggestions(firData.description, firData.crimeType);
      const topSections = ipcSuggestions.slice(0, 3).map(s => s.section);
      
      // Create FIR in database
      const fir = await storage.createFIR({
        ...firData,
        ipcSections: topSections,
      });

      // Generate PDF content
      const pdfContent = await generateFIRPDFContent(fir);
      
      // Encrypt PDF content (simulated AES-256)
      const encryptedContent = encryptData(pdfContent);
      
      // Simulate file upload (would normally upload to Supabase Storage)
      const pdfUrl = `https://storage.supabase.co/v1/object/public/fir-documents/${fir.id}.pdf`;
      
      // Update FIR with PDF URL
      await storage.updateFIRStatus(fir.id, fir.status, { pdfUrl });

      // Create case status entry
      await storage.createCaseStatus({
        caseId: fir.firNumber,
        firId: fir.id,
        userId,
        status: "pending",
        court: "District Court",
        hearingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        remarks: "Case under review by investigating officer",
      });
      
      // Log audit trail
      await storage.createAuditLog({
        userId,
        module: "fir",
        action: "create",
        details: { 
          firId: fir.id, 
          firNumber: fir.firNumber,
          ipcSections: topSections,
          encrypted: true 
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json({
        ...fir,
        ipcSections: topSections,
        pdfUrl,
        encrypted: true
      });
    } catch (error) {
      console.error("Error generating FIR:", error);
      res.status(400).json({ message: "Failed to generate FIR" });
    }
  });

  // Get all user cases endpoint  
  app.get('/api/case-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cases = await storage.getCasesByUser(userId);
      
      // Enhance with dynamic mock court data
      const enhancedCases = cases.map(caseRecord => ({
        ...caseRecord,
        courtDetails: {
          name: caseRecord.court || "District Court",
          judge: `Hon. Justice ${['R.K. Sharma', 'S.P. Singh', 'M.A. Khan'][Math.floor(Math.random() * 3)]}`,
          courtroom: `Courtroom ${Math.floor(Math.random() * 5) + 1}`,
          address: "District Court Complex, Civil Lines"
        },
        status: ['pending', 'under_investigation', 'hearing_scheduled', 'disposed'][Math.floor(Math.random() * 4)],
        hearingDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
        timeline: [
          {
            date: caseRecord.createdAt,
            event: "FIR Filed",
            status: "completed"
          },
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            event: "Investigation Started", 
            status: "completed"
          },
          {
            date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            event: "First Hearing",
            status: "upcoming"
          }
        ]
      }));

      res.json(enhancedCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  // Enhanced case status endpoint
  app.get('/api/case-status/:caseId', isAuthenticated, async (req: any, res) => {
    try {
      const { caseId } = req.params;
      const userId = req.user.claims.sub;
      
      // Get case by ID or FIR number
      const cases = await storage.getCasesByUser(userId);
      const caseRecord = cases.find(c => c.caseId === caseId || c.id === caseId);
      
      if (!caseRecord) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Enhance with mock court data
      const enhancedCase = {
        ...caseRecord,
        courtDetails: {
          name: caseRecord.court || "District Court",
          judge: caseRecord.judge || "Hon. Justice R.K. Sharma",
          courtroom: "Courtroom 3",
          address: "District Court Complex, Civil Lines"
        },
        timeline: [
          {
            date: caseRecord.createdAt,
            event: "FIR Filed",
            status: "completed"
          },
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            event: "Investigation Started",
            status: caseRecord.status === "pending" ? "pending" : "completed"
          },
          {
            date: caseRecord.hearingDate,
            event: "First Hearing",
            status: "upcoming"
          }
        ]
      };

      res.json(enhancedCase);
    } catch (error) {
      console.error("Error fetching case status:", error);
      res.status(500).json({ message: "Failed to fetch case status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI response generation
function generateLegalResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  const responses: Record<string, string> = {
    'section 498a': 'Section 498A of IPC deals with cruelty by husband or his relatives towards a married woman. It is a cognizable and non-bailable offense punishable with imprisonment up to 3 years and fine.',
    'how to file fir': 'To file an FIR: 1) Visit nearest police station, 2) Provide complete incident details, 3) Ensure FIR copy is given to you, 4) Note down FIR number for future reference. Police cannot refuse to register FIR for cognizable offenses.',
    'bail procedure': 'Bail types: 1) Regular Bail - Apply to Sessions Court/High Court, 2) Anticipatory Bail - Apply before arrest, 3) Interim Bail - Temporary relief. Required documents include bail application, surety, and affidavit.',
    'consumer court': 'Consumer disputes up to ₹20 lakhs - District Consumer Court, ₹20 lakhs to ₹1 crore - State Consumer Court, Above ₹1 crore - National Consumer Court. File complaint within 2 years of cause of action.',
    'property dispute': 'Property disputes are civil matters. File suit in civil court of appropriate jurisdiction. Required documents: Sale deed, title documents, survey records, possession certificate.',
    'domestic violence': 'Protection of Women from Domestic Violence Act, 2005 provides relief. File application before Magistrate. Available reliefs: Protection order, Residence order, Monetary relief, Custody order.',
    'cybercrime': 'For cybercrime: 1) File complaint at cyber police station, 2) Preserve digital evidence, 3) Relevant sections: IT Act 66, 66C, 66D and IPC 419, 420. Report immediately to prevent evidence loss.',
    'cheating fraud': 'IPC Section 420 - Cheating and dishonestly inducing delivery of property. Punishment: 7 years imprisonment and fine. File FIR immediately with all transaction details and evidence.'
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lowerQuery.includes(key.split(' ')[0]) || lowerQuery.includes(key)) {
      return response;
    }
  }

  return 'I understand your legal query. For specific advice, please consult a qualified lawyer. You can use this portal to file FIR, track cases, or get basic legal information. How else can I assist you?';
}

// IPC section suggestions
function generateIPCSuggestions(description: string, crimeType: string) {
  const suggestions: Array<{section: string, title: string, description: string, confidence: number}> = [];
  
  const lowerDesc = description.toLowerCase();
  const lowerType = crimeType.toLowerCase();

  if (lowerType.includes('theft') || lowerDesc.includes('steal') || lowerDesc.includes('theft')) {
    suggestions.push({
      section: '379',
      title: 'Theft',
      description: 'Whoever intends to take dishonestly any movable property out of the possession of any person',
      confidence: 0.9
    });
  }

  if (lowerType.includes('fraud') || lowerDesc.includes('cheat') || lowerDesc.includes('fraud')) {
    suggestions.push({
      section: '420',
      title: 'Cheating and dishonestly inducing delivery of property',
      description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property',
      confidence: 0.85
    });
  }

  if (lowerType.includes('assault') || lowerDesc.includes('assault') || lowerDesc.includes('attack')) {
    suggestions.push({
      section: '351',
      title: 'Assault',
      description: 'Whoever makes any gesture or preparation intending or knowing it to be likely to cause apprehension',
      confidence: 0.8
    });
  }

  if (lowerType.includes('cybercrime') || lowerDesc.includes('online') || lowerDesc.includes('internet')) {
    suggestions.push({
      section: 'IT Act 66',
      title: 'Computer related offenses',
      description: 'If any person, dishonestly or fraudulently, does any act referred to in section 43',
      confidence: 0.9
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Mock BERT/DistilBERT NLP Pipeline (simulates HuggingFace Transformers)
async function mockNLPPipeline(text: string) {
  // Simulate BERT intent classification
  const intents = [
    { label: 'legal_query', score: 0.85 },
    { label: 'crime_reporting', score: 0.12 },
    { label: 'court_procedure', score: 0.03 }
  ];
  
  // Simulate named entity recognition
  const entities = [];
  if (text.includes('498a') || text.includes('498-a')) {
    entities.push({ entity: 'IPC_SECTION', value: '498A', confidence: 0.95 });
  }
  if (text.includes('bail')) {
    entities.push({ entity: 'LEGAL_TERM', value: 'bail', confidence: 0.88 });
  }
  
  return { intents, entities, confidence: Math.max(...intents.map(i => i.score)) };
}

// Enhanced AI response generation with BERT-like processing
async function generateEnhancedLegalResponse(query: string, language: string = 'english') {
  const lowerQuery = query.toLowerCase();
  
  // Run mock NLP pipeline (simulates HuggingFace Transformers)
  const nlpResult = await mockNLPPipeline(query);
  
  // Enhanced knowledge base with confidence scoring
  const knowledgeBase = [
    {
      keywords: ['section 498a', '498-a', 'domestic violence', 'dowry', 'cruelty', 'husband'],
      response: 'Section 498A of IPC deals with cruelty by husband or his relatives towards a married woman. It is a cognizable and non-bailable offense punishable with imprisonment up to 3 years and fine.',
      confidence: 0.95,
      suggestedActions: ['File FIR', 'Contact women helpline 1091', 'Gather evidence'],
      relatedSections: ['Section 304B (Dowry Death)', 'Section 406 (Criminal Breach of Trust)']
    },
    {
      keywords: ['bail', 'anticipatory bail', 'regular bail', 'surety', 'custody'],
      response: 'Bail types: 1) Regular Bail - Apply to Sessions Court/High Court, 2) Anticipatory Bail - Apply before arrest, 3) Interim Bail - Temporary relief. Required documents include bail application, surety, and affidavit.',
      confidence: 0.9,
      suggestedActions: ['Consult lawyer', 'Arrange surety', 'Prepare documents'],
      relatedSections: ['Section 437 CrPC', 'Section 438 CrPC']
    },
    {
      keywords: ['cybercrime', 'online fraud', 'digital fraud', 'internet crime', 'hacking'],
      response: 'For cybercrime: 1) File complaint at cyber police station, 2) Preserve digital evidence, 3) Relevant sections: IT Act 66, 66C, 66D and IPC 419, 420. Report immediately to prevent evidence loss.',
      confidence: 0.88,
      suggestedActions: ['File online complaint', 'Preserve evidence', 'Report to bank'],
      relatedSections: ['IT Act Section 66', 'IT Act Section 66C', 'IPC Section 420']
    }
  ];

  // Intent classification simulation (BERT-like processing)
  let bestMatch = {
    text: 'I understand your legal query. For specific advice, please consult a qualified lawyer. You can use this portal to file FIR, track cases, or get basic legal information.',
    confidence: 0.3,
    suggestedActions: ['File FIR if criminal matter', 'Consult lawyer', 'Gather evidence'],
    relatedSections: []
  };

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1;
      }
    }
    
    const confidence = Math.min(score / entry.keywords.length + 0.2, 1.0);
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        text: entry.response,
        confidence,
        suggestedActions: entry.suggestedActions || [],
        relatedSections: entry.relatedSections || []
      };
    }
  }

  // Language support
  if (language === 'hindi' && bestMatch.confidence > 0.5) {
    bestMatch.text = `${bestMatch.text}\n\n[हिंदी में सहायता उपलब्ध है - कानूनी सलाह के लिए योग्य वकील से संपर्क करें]`;
  } else if (language === 'marathi' && bestMatch.confidence > 0.5) {
    bestMatch.text = `${bestMatch.text}\n\n[मराठी मध्ये मदत उपलब्ध आहे - कायदेशीर सल्ल्यासाठी पात्र वकीलाशी संपर्क साधा]`;
  }

  // Enhance response with NLP insights
  bestMatch.nlpInsights = {
    detectedIntent: nlpResult.intents[0].label,
    entities: nlpResult.entities,
    processingConfidence: nlpResult.confidence
  };

  return bestMatch;
}

// AES-256 encryption simulation
function encryptData(data: string): string {
  // In production, use proper AES-256 encryption
  // This is a simulation for demonstration
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

// Generate FIR PDF content
async function generateFIRPDFContent(fir: any): Promise<string> {
  return `
FIRST INFORMATION REPORT (FIR)
===============================

FIR Number: ${fir.firNumber}
Date: ${new Date(fir.createdAt).toLocaleDateString()}
Police Station: ${fir.policeStation || 'TBD'}

INCIDENT DETAILS:
Crime Type: ${fir.crimeType}
Date of Incident: ${new Date(fir.incidentDate).toLocaleDateString()}
Time of Incident: ${fir.incidentTime}
Location: ${fir.location}

DESCRIPTION:
${fir.description}

IPC SECTIONS:
${fir.ipcSections?.join(', ') || 'To be determined'}

STATUS: ${fir.status}
INVESTIGATING OFFICER: ${fir.investigatingOfficer || 'To be assigned'}

This is a computer-generated document.
Generated on: ${new Date().toLocaleString()}
  `;
}
