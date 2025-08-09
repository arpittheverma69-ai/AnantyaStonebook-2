// Test detailed inventory response
// Run with: node test-inventory-response.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testInventoryResponse() {
  try {
    console.log('🧪 Testing detailed inventory response...');
    
    const prompt = `You are a helpful AI business analyst. Provide detailed information when users ask for specific data (inventory, sales, clients, etc.) and concise analysis for general questions.

CRITICAL: NO bold text (**), NO excessive emojis. For detailed lists, show complete database information. For analysis, keep responses under 100 words.

You have access to the following business data:

SALES DATA (2 records):
Total Sales: 2
Total Revenue: ₹15773110
Average Sale Value: ₹7886555

DETAILED SALES LIST:
1. Unknown Gem - ₹14324200
   - Client: Unknown Client
   - Date: 2024-01-15
   - Quantity: 1
   - Status: Completed
   - Payment: Paid

2. Unknown Gem - ₹1448910
   - Client: Unknown Client
   - Date: 2024-01-15
   - Quantity: 1
   - Status: Completed
   - Payment: Paid

INVENTORY DATA (1 records):
Total Items: 1
Total Value: ₹1000000
Certified Items: 0
Available Items: 1

DETAILED INVENTORY LIST:
1. Unknown Gem
   - Price: ₹1000000
   - Quantity: 1
   - Weight: 5 carats
   - Certified: No
   - Available: Yes
   - Color: Blue
   - Clarity: VS1
   - Cut: Excellent

CLIENT DATA (2 records):
Total Clients: 2
Recurring Clients: 0
Trustworthy Clients: 2

DETAILED CLIENT LIST:
1. Arpit Verma
   - Phone: +91-9876543210
   - Email: arpit@example.com
   - Address: Mumbai, India
   - Recurring: No
   - Trustworthy: Yes
   - Notes: High-value customer

2. John Doe
   - Phone: +1-555-123-4567
   - Email: john@example.com
   - Address: New York, USA
   - Recurring: No
   - Trustworthy: Yes
   - Notes: International client

USER QUERY: "Show me my inventory"

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
- Focus on immediate actionable items`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Detailed Inventory Response:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    console.log(`Word count: ${text.split(' ').length}`);
    console.log(`Character count: ${text.length}`);
    
    // Check for detailed information
    if (text.includes('DETAILED INVENTORY LIST') || text.includes('Price:') || text.includes('Weight:')) {
      console.log('✅ Contains detailed inventory information');
    } else {
      console.log('❌ Missing detailed inventory information');
    }
    
    if (text.includes('**')) {
      console.log('❌ Still contains bold formatting (**)');
    } else {
      console.log('✅ No bold formatting found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInventoryResponse();
