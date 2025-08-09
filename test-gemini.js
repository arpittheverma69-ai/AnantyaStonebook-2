// Simple test for Gemini integration
// Run with: node test-gemini.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Check if API key is set
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('❌ GEMINI_API_KEY not found in environment variables');
  console.log('Please set your Gemini API key in the .env file');
  console.log('Get your API key from: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini AI integration...');
    
    const prompt = `You are an expert AI business analyst specializing in gemstone and jewelry businesses. 
    
    Please provide a brief analysis of what a gemstone business owner should focus on for:
    1. Inventory management
    2. Customer relationships
    3. Profit optimization
    
    Keep the response concise and practical.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API is working!');
    console.log('\n📝 Sample Response:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if your API key is correct');
    console.log('2. Ensure you have internet connectivity');
    console.log('3. Verify your API key has the necessary permissions');
  }
}

testGemini();
