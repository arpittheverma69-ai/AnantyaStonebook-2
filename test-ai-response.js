// Test AI response format
// Run with: node test-ai-response.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testAIResponse() {
  try {
    console.log('🧪 Testing new AI response format...');
    
    const prompt = `You are a concise AI business analyst. Provide SHORT, DIRECT responses with bullet points only.

CRITICAL: NO bold text (**), NO long explanations, NO excessive emojis. Keep responses under 100 words.

You have access to the following business data:

SALES DATA (2 records):
Total Sales: 2
Total Revenue: ₹15773110
Average Sale Value: ₹7886555

INVENTORY DATA (1 records):
Total Items: 1
Total Value: ₹1000000
Certified Items: 0
Available Items: 1

CLIENT DATA (2 records):
Total Clients: 2
Recurring Clients: 0
Trustworthy Clients: 2

USER QUERY: "Show me my business overview"

Provide a very brief, direct analysis:

1. Answer the query in 1-2 sentences maximum
2. List 3-4 key metrics as bullet points
3. Give 2-3 actionable recommendations as bullet points

CRITICAL FORMATTING RULES:
- Use bullet points (•) ONLY - NO bold text, NO asterisks
- Keep total response under 100 words
- Use minimal emojis (max 2-3 total)
- Write in simple, clear language
- Focus on immediate actionable items
- NO long explanations or detailed analysis`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ New AI Response Format:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    console.log(`Word count: ${text.split(' ').length}`);
    console.log(`Character count: ${text.length}`);
    
    // Check for formatting issues
    if (text.includes('**')) {
      console.log('❌ Still contains bold formatting (**)');
    } else {
      console.log('✅ No bold formatting found');
    }
    
    if (text.split(' ').length > 100) {
      console.log('❌ Response is too long (>100 words)');
    } else {
      console.log('✅ Response length is good');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIResponse();
