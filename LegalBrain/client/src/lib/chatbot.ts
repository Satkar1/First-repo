interface LegalResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
  relatedSections?: string[];
}

interface LegalKnowledgeBase {
  [key: string]: {
    response: string;
    confidence: number;
    keywords: string[];
    suggestedActions?: string[];
    relatedSections?: string[];
  };
}

const legalKnowledgeBase: LegalKnowledgeBase = {
  'section_498a': {
    response: 'Section 498A of the Indian Penal Code deals with cruelty by husband or his relatives towards a married woman. It is a cognizable and non-bailable offense punishable with imprisonment up to 3 years and fine. The offense covers both physical and mental cruelty including dowry harassment.',
    confidence: 0.95,
    keywords: ['498a', '498-a', 'domestic violence', 'dowry', 'cruelty', 'husband', 'in-laws'],
    suggestedActions: ['File FIR', 'Contact women helpline', 'Gather evidence'],
    relatedSections: ['Section 304B (Dowry Death)', 'Section 406 (Criminal Breach of Trust)']
  },
  'fir_filing': {
    response: 'To file an FIR (First Information Report): 1) Visit the nearest police station, 2) Provide complete incident details in writing, 3) Ensure the FIR copy is given to you with the FIR number, 4) Keep the acknowledgment safely. Police cannot refuse to register FIR for cognizable offenses.',
    confidence: 0.9,
    keywords: ['file fir', 'register fir', 'police station', 'complaint', 'report crime'],
    suggestedActions: ['Visit police station', 'Gather evidence', 'Prepare incident details'],
    relatedSections: ['Section 154 CrPC (Information in cognizable cases)']
  },
  'bail_procedure': {
    response: 'Bail can be of three types: 1) Regular Bail - Apply to Sessions Court/High Court for non-bailable offenses, 2) Anticipatory Bail - Apply before arrest under Section 438 CrPC, 3) Interim Bail - Temporary relief. Required documents include bail application, surety arrangement, and affidavit of surety.',
    confidence: 0.85,
    keywords: ['bail', 'anticipatory bail', 'regular bail', 'surety', 'custody'],
    suggestedActions: ['Consult lawyer', 'Arrange surety', 'Prepare documents'],
    relatedSections: ['Section 437 CrPC (Bail)', 'Section 438 CrPC (Anticipatory Bail)']
  },
  'consumer_court': {
    response: 'Consumer disputes are handled by three-tier system: 1) District Consumer Court (up to ₹20 lakhs), 2) State Consumer Court (₹20 lakhs to ₹1 crore), 3) National Consumer Court (above ₹1 crore). File complaint within 2 years of cause of action. Required documents include purchase receipt, warranty card, and evidence of deficiency.',
    confidence: 0.8,
    keywords: ['consumer court', 'consumer dispute', 'defective product', 'service deficiency'],
    suggestedActions: ['Gather purchase documents', 'Document the deficiency', 'File complaint online'],
    relatedSections: ['Consumer Protection Act 2019']
  },
  'property_dispute': {
    response: 'Property disputes are primarily civil matters handled by civil courts. File a suit for declaration, possession, or partition in the court of appropriate jurisdiction. Required documents include sale deed, title documents, survey records, and possession certificate. Consider mediation before litigation.',
    confidence: 0.75,
    keywords: ['property dispute', 'land dispute', 'title', 'possession', 'ownership'],
    suggestedActions: ['Verify title documents', 'Consult civil lawyer', 'Consider mediation'],
    relatedSections: ['Transfer of Property Act 1882', 'Registration Act 1908']
  },
  'cybercrime': {
    response: 'For cybercrime complaints: 1) File complaint at nearest cyber police station or online at cybercrime.gov.in, 2) Preserve all digital evidence (screenshots, emails, transactions), 3) Relevant sections include IT Act 66 (Computer related offenses), 66C (Identity theft), 66D (Cheating by personation) and IPC 419 (Cheating by personation), 420 (Cheating).',
    confidence: 0.9,
    keywords: ['cybercrime', 'online fraud', 'digital fraud', 'internet crime', 'hacking'],
    suggestedActions: ['File online complaint', 'Preserve digital evidence', 'Block fraudulent accounts'],
    relatedSections: ['IT Act Section 66', 'IT Act Section 66C', 'IPC Section 420']
  },
  'cheating_fraud': {
    response: 'IPC Section 420 deals with cheating and dishonestly inducing delivery of property. Punishment includes imprisonment up to 7 years and fine. For financial fraud, also consider Section 409 (Criminal breach of trust by public servant) and various sections under the Prevention of Money Laundering Act.',
    confidence: 0.85,
    keywords: ['cheating', 'fraud', 'financial fraud', 'scam', 'money'],
    suggestedActions: ['File FIR immediately', 'Gather transaction evidence', 'Report to bank'],
    relatedSections: ['Section 420 (Cheating)', 'Section 406 (Criminal breach of trust)']
  },
  'divorce': {
    response: 'Divorce can be filed under various grounds: 1) Mutual consent divorce (Section 13B Hindu Marriage Act), 2) Contested divorce on grounds like cruelty, desertion, adultery. Required documents include marriage certificate, evidence of grounds, income proof. Consider counseling before legal proceedings.',
    confidence: 0.8,
    keywords: ['divorce', 'separation', 'marriage dissolution', 'matrimonial'],
    suggestedActions: ['Attempt reconciliation', 'Consult family lawyer', 'Gather evidence'],
    relatedSections: ['Hindu Marriage Act 1955', 'Special Marriage Act 1954']
  },
  'child_custody': {
    response: 'Child custody is determined by the best interest of the child principle. Types include physical custody, legal custody, joint custody. Courts consider factors like child\'s age, preference (if above 9 years), parent\'s financial status, and living conditions. File petition under Guardians and Wards Act.',
    confidence: 0.75,
    keywords: ['child custody', 'custody battle', 'guardianship', 'child welfare'],
    suggestedActions: ['Document child care', 'Maintain stability', 'Consider mediation'],
    relatedSections: ['Guardians and Wards Act 1890', 'Hindu Minority and Guardianship Act 1956']
  },
  'labour_dispute': {
    response: 'Labour disputes can be resolved through: 1) Internal grievance mechanism, 2) Labour Commissioner office, 3) Industrial Tribunal, 4) Labour Court. Common issues include wrongful termination, non-payment of wages, harassment. File complaint within prescribed time limits.',
    confidence: 0.7,
    keywords: ['labour dispute', 'employment issue', 'wrongful termination', 'salary issue'],
    suggestedActions: ['Document workplace issues', 'Approach labour commissioner', 'Maintain records'],
    relatedSections: ['Industrial Disputes Act 1947', 'Labour Laws']
  }
};

export class LegalChatbotService {
  private static instance: LegalChatbotService;
  
  private constructor() {}
  
  public static getInstance(): LegalChatbotService {
    if (!LegalChatbotService.instance) {
      LegalChatbotService.instance = new LegalChatbotService();
    }
    return LegalChatbotService.instance;
  }

  public generateResponse(query: string, language: string = 'english'): LegalResponse {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Find the best matching response
    let bestMatch: LegalResponse = {
      response: this.getDefaultResponse(),
      confidence: 0.3
    };

    for (const [key, data] of Object.entries(legalKnowledgeBase)) {
      const confidence = this.calculateConfidence(normalizedQuery, data.keywords);
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          response: data.response,
          confidence,
          suggestedActions: data.suggestedActions,
          relatedSections: data.relatedSections
        };
      }
    }

    // If confidence is too low, provide a generic helpful response
    if (bestMatch.confidence < 0.4) {
      bestMatch = {
        response: this.getContextualResponse(normalizedQuery),
        confidence: 0.5,
        suggestedActions: ['File FIR if criminal matter', 'Consult a lawyer', 'Gather evidence'],
        relatedSections: []
      };
    }

    return bestMatch;
  }

  private calculateConfidence(query: string, keywords: string[]): number {
    let matches = 0;
    let totalKeywords = keywords.length;
    
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        matches++;
      }
    }
    
    // Calculate confidence based on keyword matches and query relevance
    const keywordConfidence = matches / totalKeywords;
    const lengthBonus = Math.min(query.length / 50, 0.2); // Bonus for detailed queries
    
    return Math.min(keywordConfidence + lengthBonus, 1.0);
  }

  private getDefaultResponse(): string {
    return 'I understand your legal query. For specific legal advice tailored to your situation, I recommend consulting with a qualified lawyer. You can use this portal to file an FIR, track your cases, or get basic legal information. How else can I assist you with your legal matters?';
  }

  private getContextualResponse(query: string): string {
    // Provide contextual responses based on common legal terms
    if (query.includes('court') || query.includes('hearing')) {
      return 'For court-related matters, ensure you have all necessary documents and arrive on time. If you need to track your case status, you can use the case tracking feature. For specific procedural questions, consult your lawyer or the court clerk.';
    }
    
    if (query.includes('police') || query.includes('arrest')) {
      return 'If you need to interact with police, remember your rights: right to remain silent, right to legal representation, and right to know the charges. For filing complaints, visit the nearest police station with all relevant evidence.';
    }
    
    if (query.includes('lawyer') || query.includes('advocate')) {
      return 'When choosing a lawyer, consider their expertise in your specific legal area, experience, fee structure, and communication style. You can find lawyers through bar associations, legal directories, or referrals.';
    }
    
    if (query.includes('document') || query.includes('evidence')) {
      return 'Always maintain proper documentation and evidence for your legal matters. Keep original documents safe, make multiple copies, and organize them chronologically. Digital evidence should be preserved in its original format.';
    }
    
    return this.getDefaultResponse();
  }

  public getSuggestedQuestions(): string[] {
    return [
      'How to file an FIR?',
      'What is Section 498A?',
      'Bail procedure in India',
      'Consumer court process',
      'Property dispute resolution',
      'Cybercrime reporting',
      'Divorce procedure',
      'Child custody laws',
      'Labour dispute resolution',
      'Legal aid services'
    ];
  }

  public getEmergencyContacts(): Array<{name: string, number: string, description: string}> {
    return [
      {
        name: 'Police Emergency',
        number: '100',
        description: 'For immediate police assistance'
      },
      {
        name: 'Women Helpline',
        number: '1091',
        description: 'For women in distress'
      },
      {
        name: 'Child Helpline',
        number: '1098',
        description: 'For child-related emergencies'
      },
      {
        name: 'Cyber Crime Helpline',
        number: '155260',
        description: 'For cybercrime reporting'
      },
      {
        name: 'Legal Aid',
        number: '15100',
        description: 'For free legal aid services'
      }
    ];
  }
}

export const chatbotService = LegalChatbotService.getInstance();
