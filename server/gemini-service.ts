import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface BusinessData {
  sales: any[];
  inventory: any[];
  clients: any[];
  suppliers: any[];
  certifications: any[];
  consultations: any[];
  tasks: any[];
}

export interface AnalysisRequest {
  query: string;
  businessData: BusinessData;
  context?: string;
}

export interface AnalysisResponse {
  content: string;
  analysis?: any;
  suggestions?: string[];
  insights?: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async analyzeBusinessData(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response and extract structured data
      const analysis = this.parseAnalysisResponse(text, request.query);

      return {
        content: text,
        analysis,
        suggestions: this.extractSuggestions(text),
        insights: this.extractInsights(text)
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to analyze business data with AI');
    }
  }

  private buildPrompt(request: AnalysisRequest): string {
    const { query, businessData, context } = request;
    
    const businessContext = `
You are a helpful AI business analyst. Provide detailed information when users ask for specific data (inventory, sales, clients, etc.) and concise analysis for general questions.

CRITICAL: NO bold text (**), NO excessive emojis. For detailed lists, show complete database information. For analysis, keep responses under 100 words.

You have access to the following business data:

SALES DATA (${businessData.sales.length} records):
${this.formatSalesData(businessData.sales)}

INVENTORY DATA (${businessData.inventory.length} records):
${this.formatInventoryData(businessData.inventory)}

CLIENT DATA (${businessData.clients.length} records):
${this.formatClientData(businessData.clients)}

SUPPLIER DATA (${businessData.suppliers.length} records):
${this.formatSupplierData(businessData.suppliers)}

CERTIFICATION DATA (${businessData.certifications.length} records):
${this.formatCertificationData(businessData.certifications)}

TASK DATA (${businessData.tasks.length} records):
${this.formatTaskData(businessData.tasks)}

CONTEXT: ${context || 'General business analysis'}

USER QUERY: "${query}"

Provide analysis based on the query:

If user asks for specific data (inventory, sales, clients, etc.):
- Show detailed list with all available information
- Include item-by-item breakdown
- Provide complete database information

If user asks for general analysis:
- Answer in 1-2 sentences maximum
- List 3-4 key metrics as bullet points
- Give 2-3 actionable recommendations as bullet points

CRITICAL FORMATTING RULES:
- Use bullet points (•) ONLY - NO bold text, NO asterisks
- For detailed lists: show complete information
- For analysis: keep under 100 words
- Use minimal emojis (max 2-3 total)
- Write in simple, clear language
- Focus on immediate actionable items
`;

    return businessContext;
  }

  private formatSalesData(sales: any[]): string {
    if (sales.length === 0) return 'No sales data available';
    
    const summary = sales.reduce((acc, sale) => {
      acc.totalRevenue += parseFloat(sale.totalAmount || '0');
      acc.totalSales += 1;
      return acc;
    }, { totalRevenue: 0, totalSales: 0 });

    const recentSales = sales
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
      .slice(0, 5);

    return `
Total Sales: ${summary.totalSales}
Total Revenue: ₹${summary.totalRevenue.toLocaleString()}
Average Sale Value: ₹${(summary.totalRevenue / summary.totalSales).toFixed(2)}

DETAILED SALES LIST:
${sales.map((sale, index) => 
  `${index + 1}. ${sale.gemName || 'Unknown Gem'} - ₹${sale.totalAmount}
   - Client: ${sale.clientName || 'Unknown Client'}
   - Date: ${sale.date || sale.createdAt}
   - Quantity: ${sale.quantity || '1'}
   - Status: ${sale.status || 'Completed'}
   - Payment: ${sale.paymentStatus || 'Paid'}`
).join('\n\n')}

Recent Sales:
${recentSales.map(sale => 
  `- ${sale.clientName || 'Unknown Client'}: ${sale.gemName || 'Unknown Gem'} - ₹${sale.totalAmount} (${sale.date || sale.createdAt})`
).join('\n')}
`;
  }

  private formatInventoryData(inventory: any[]): string {
    if (inventory.length === 0) return 'No inventory data available';
    
    const summary = inventory.reduce((acc, item) => {
      acc.totalValue += parseFloat(item.totalPrice || item.sellingPrice || '0');
      acc.certifiedCount += item.certified ? 1 : 0;
      acc.availableCount += item.isAvailable ? 1 : 0;
      return acc;
    }, { totalValue: 0, certifiedCount: 0, availableCount: 0 });

    const lowStockItems = inventory.filter(item => 
      parseFloat(item.quantity || '0') < 5
    ).slice(0, 5);

    return `
Total Items: ${inventory.length}
Total Value: ₹${summary.totalValue.toLocaleString()}
Certified Items: ${summary.certifiedCount}
Available Items: ${summary.availableCount}

DETAILED INVENTORY LIST:
${inventory.map((item, index) => 
  `${index + 1}. ${item.gemId || item.type || 'Unknown Gem'}
   - Price: ₹${item.totalPrice || item.sellingPrice || '0'}
   - Quantity: ${item.quantity || '0'}
   - Weight: ${item.weight || '0'} carats
   - Certified: ${item.certified ? 'Yes' : 'No'}
   - Available: ${item.isAvailable ? 'Yes' : 'No'}
   - Color: ${item.color || 'N/A'}
   - Clarity: ${item.clarity || 'N/A'}
   - Cut: ${item.cut || 'N/A'}`
).join('\n\n')}

Low Stock Items:
${lowStockItems.map(item => 
  `- ${item.gemId || item.type || 'Unknown'}: ${item.quantity} units remaining`
).join('\n')}
`;
  }

  private formatClientData(clients: any[]): string {
    if (clients.length === 0) return 'No client data available';
    
    const summary = clients.reduce((acc, client) => {
      acc.recurringCount += client.isRecurring ? 1 : 0;
      acc.trustworthyCount += client.isTrustworthy ? 1 : 0;
      return acc;
    }, { recurringCount: 0, trustworthyCount: 0 });

    const topClients = clients
      .filter(client => client.isRecurring || client.isTrustworthy)
      .slice(0, 5);

    return `
Total Clients: ${clients.length}
Recurring Clients: ${summary.recurringCount}
Trustworthy Clients: ${summary.trustworthyCount}

DETAILED CLIENT LIST:
${clients.map((client, index) => 
  `${index + 1}. ${client.name}
   - Phone: ${client.phone || 'N/A'}
   - Email: ${client.email || 'N/A'}
   - Address: ${client.address || 'N/A'}
   - Recurring: ${client.isRecurring ? 'Yes' : 'No'}
   - Trustworthy: ${client.isTrustworthy ? 'Yes' : 'No'}
   - Notes: ${client.notes || 'N/A'}`
).join('\n\n')}

Top Clients:
${topClients.map(client => 
  `- ${client.name}: ${client.phone} (${client.isRecurring ? 'Recurring' : ''} ${client.isTrustworthy ? 'Trustworthy' : ''})`
).join('\n')}
`;
  }

  private formatSupplierData(suppliers: any[]): string {
    if (suppliers.length === 0) return 'No supplier data available';
    
    const summary = suppliers.reduce((acc, supplier) => {
      acc.domesticCount += supplier.type === 'Domestic' ? 1 : 0;
      acc.internationalCount += supplier.type === 'International' ? 1 : 0;
      acc.highQualityCount += (supplier.qualityRating || 0) >= 4 ? 1 : 0;
      return acc;
    }, { domesticCount: 0, internationalCount: 0, highQualityCount: 0 });

    const topSuppliers = suppliers
      .filter(supplier => (supplier.qualityRating || 0) >= 4)
      .sort((a, b) => (b.qualityRating || 0) - (a.qualityRating || 0))
      .slice(0, 5);

    return `
Total Suppliers: ${suppliers.length}
Domestic: ${summary.domesticCount}
International: ${summary.internationalCount}
High Quality (4+ rating): ${summary.highQualityCount}

Top Suppliers:
${topSuppliers.map(supplier => 
  `- ${supplier.name}: ${supplier.type} (Rating: ${supplier.qualityRating}/5)`
).join('\n')}
`;
  }

  private formatCertificationData(certifications: any[]): string {
    if (certifications.length === 0) return 'No certification data available';
    
    const summary = certifications.reduce((acc, cert) => {
      acc.pendingCount += cert.status === 'Pending' ? 1 : 0;
      acc.completedCount += cert.status === 'Certified' ? 1 : 0;
      acc.inProgressCount += cert.status === 'In Progress' ? 1 : 0;
      return acc;
    }, { pendingCount: 0, completedCount: 0, inProgressCount: 0 });

    return `
Total Certifications: ${certifications.length}
Pending: ${summary.pendingCount}
In Progress: ${summary.inProgressCount}
Completed: ${summary.completedCount}
`;
  }

  private formatTaskData(tasks: any[]): string {
    if (tasks.length === 0) return 'No task data available';
    
    const summary = tasks.reduce((acc, task) => {
      acc.pendingCount += task.status === 'pending' ? 1 : 0;
      acc.completedCount += task.status === 'completed' ? 1 : 0;
      acc.highPriorityCount += task.priority === 'high' ? 1 : 0;
      return acc;
    }, { pendingCount: 0, completedCount: 0, highPriorityCount: 0 });

    const pendingTasks = tasks
      .filter(task => task.status === 'pending')
      .slice(0, 5);

    return `
Total Tasks: ${tasks.length}
Pending: ${summary.pendingCount}
Completed: ${summary.completedCount}
High Priority: ${summary.highPriorityCount}

Pending Tasks:
${pendingTasks.map(task => 
  `- ${task.title}: ${task.priority} priority (${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'})`
).join('\n')}
`;
  }

  private parseAnalysisResponse(text: string, query: string): any {
    const lowerQuery = query.toLowerCase();
    
    // Extract structured data based on query type
    if (lowerQuery.includes('profit') || lowerQuery.includes('margin')) {
      return { type: 'profit_analysis', content: text };
    } else if (lowerQuery.includes('client') || lowerQuery.includes('customer')) {
      return { type: 'client_analysis', content: text };
    } else if (lowerQuery.includes('inventory') || lowerQuery.includes('stock')) {
      return { type: 'inventory_analysis', content: text };
    } else if (lowerQuery.includes('growth') || lowerQuery.includes('trend')) {
      return { type: 'growth_analysis', content: text };
    } else if (lowerQuery.includes('overview') || lowerQuery.includes('summary')) {
      return { type: 'business_overview', content: text };
    } else {
      return { type: 'general_analysis', content: text };
    }
  }

  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('recommendation')) {
        const suggestion = line.replace(/^[•\-]\s*/, '').trim();
        if (suggestion && suggestion.length > 10) {
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private extractInsights(text: string): string[] {
    const insights: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('insight') || line.includes('trend') || line.includes('pattern')) {
        const insight = line.trim();
        if (insight && insight.length > 10) {
          insights.push(insight);
        }
      }
    }
    
    return insights.slice(0, 3); // Return top 3 insights
  }

  async generateBusinessInsights(businessData: BusinessData): Promise<string[]> {
    try {
      const prompt = `
Based on the following gemstone business data, provide 3 concise, actionable business insights:

${this.formatSalesData(businessData.sales)}
${this.formatInventoryData(businessData.inventory)}
${this.formatClientData(businessData.clients)}

CRITICAL REQUIREMENTS:
- Each insight must be 1 sentence maximum
- Use bullet points (•) only - NO bold text
- Keep total under 50 words
- Focus on immediate actions
- Simple, clear language only
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.extractInsights(text);
    } catch (error) {
      console.error('Error generating business insights:', error);
      return [];
    }
  }

  async generateRecommendations(businessData: BusinessData, focusArea: string): Promise<string[]> {
    try {
      const prompt = `
Based on the following gemstone business data, provide 3 specific recommendations for improving ${focusArea}:

${this.formatSalesData(businessData.sales)}
${this.formatInventoryData(businessData.inventory)}
${this.formatClientData(businessData.clients)}
${this.formatSupplierData(businessData.suppliers)}

CRITICAL REQUIREMENTS:
- Each recommendation must be 1 sentence maximum
- Use bullet points (•) only - NO bold text
- Keep total under 50 words
- Focus on immediate actions
- Simple, clear language only
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.extractSuggestions(text);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const systemPrompt = `You are an expert Chartered Accountant (CA) with deep knowledge of taxation, GST, and financial strategies in India. You also specialize in the gemstone and jewelry industry, knowing every small and big trick to:

Save maximum tax legally
Optimize GST input and output
Structure the business for high profitability
Handle imports, exports, and compliance specific to gemstones
Suggest investment structures, audits, and accounting tricks
Guide on invoices, billing, and international trade for gems
Increase net profit while staying 100% compliant with Indian tax laws

Your goal is to help gemstone businesses start and scale from sourcing to selling, both offline and online, and make them highly profitable.

Provide detailed practical plans like you are their personal CA, not textbook answers. Include examples with numbers wherever possible. Focus on gemstone business realities, not just general business advice.

Format: Use proper markdown formatting with **bold text**, # headings, bullet points (•), and tables with | separators. For tables, use proper markdown table format with headers, separator line (|----|), and data rows. Include specific section numbers (Section 80C, HSN 7103), and provide actionable steps with examples. Keep responses comprehensive but well-structured.`;

      const fullPrompt = `${systemPrompt}

Query: ${prompt}

Provide practical, actionable advice for this gemstone business query.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Post-process to clean up formatting while preserving structure
      text = text
        .replace(/\n\n+/g, '\n\n') // Normalize line breaks
        .trim();
      
      // Limit to approximately 500 words for comprehensive responses
      const words = text.split(' ');
      if (words.length > 500) {
        text = words.slice(0, 500).join(' ') + '...';
      }
      
      return text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw new Error('Failed to generate text with Gemini AI');
    }
  }
}

export const geminiService = new GeminiService();
