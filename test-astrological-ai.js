// Test Astrological AI functionality
// Run with: node test-astrological-ai.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testAstrologicalAI() {
  try {
    console.log('🧪 Testing Astrological AI...');
    
    const prompt = `You are an expert astrological gemstone consultant. Analyze the compatibility between Leo and various gemstones.

CUSTOMER PROFILE:
• Zodiac Sign: Leo
• Birth Date: Not provided
• Specific Concerns: Love & Relationships, Career & Success

GEMSTONE DATABASE:
Ruby:
   • Zodiac Compatibility: Aries, Leo, Scorpio
   • Benefits: Courage, Leadership, Energy, Passion
   • Properties: Red corundum, associated with Sun and Mars

Pearl:
   • Zodiac Compatibility: Cancer, Libra, Pisces
   • Benefits: Emotional Balance, Intuition, Peace, Fertility
   • Properties: Organic gem, associated with Moon

Emerald:
   • Zodiac Compatibility: Taurus, Gemini, Virgo
   • Benefits: Communication, Wisdom, Growth, Harmony
   • Properties: Green beryl, associated with Mercury

Diamond:
   • Zodiac Compatibility: Aries, Leo, Libra
   • Benefits: Clarity, Strength, Purity, Success
   • Properties: Pure carbon, associated with Venus

Sapphire:
   • Zodiac Compatibility: Taurus, Virgo, Capricorn
   • Benefits: Wisdom, Truth, Loyalty, Spirituality
   • Properties: Blue corundum, associated with Saturn

ANALYSIS REQUIREMENTS:
1. Evaluate compatibility for each gemstone (Excellent/Good/Moderate/Avoid)
2. Provide specific reasons for recommendations
3. Suggest alternatives for incompatible stones
4. Include timing advice for wearing stones
5. Give general astrological advice

FORMAT RESPONSE AS:
COMPATIBILITY ANALYSIS:
[Stone Name] - [Compatibility Level]
• Benefits: [list]
• Reasons: [why it's good/bad]
• Alternatives: [if needed]

TIMING ADVICE:
[When to wear stones]

GENERAL ADVICE:
[Astrological recommendations]

Keep response concise, practical, and easy to understand. Focus on actionable advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Astrological AI Response:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    console.log(`Word count: ${text.split(' ').length}`);
    console.log(`Character count: ${text.length}`);
    
    // Check for astrological content
    if (text.includes('COMPATIBILITY ANALYSIS') || text.includes('Excellent') || text.includes('Good')) {
      console.log('✅ Contains astrological analysis');
    } else {
      console.log('❌ Missing astrological analysis');
    }
    
    if (text.includes('TIMING ADVICE') || text.includes('GENERAL ADVICE')) {
      console.log('✅ Contains timing and general advice');
    } else {
      console.log('❌ Missing timing and general advice');
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

testAstrologicalAI();
