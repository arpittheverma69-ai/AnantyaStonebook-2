import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface AstrologicalProfile {
  zodiacSign: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  specificConcerns?: string[];
}

export interface GemstoneRecommendation {
  stone: string;
  benefits: string[];
  compatibility: 'Excellent' | 'Good' | 'Moderate' | 'Avoid';
  reasons: string[];
  alternatives?: string[];
}

export interface AstrologicalAnalysis {
  profile: AstrologicalProfile;
  recommendations: GemstoneRecommendation[];
  generalAdvice: string[];
  timing: string;
}

export class AstrologicalAIService {
  private gemstoneDatabase = {
    'Ruby': {
      zodiac: ['Aries', 'Leo', 'Scorpio'],
      benefits: ['Courage', 'Leadership', 'Energy', 'Passion'],
      properties: 'Red corundum, associated with Sun and Mars'
    },
    'Pearl': {
      zodiac: ['Cancer', 'Libra', 'Pisces'],
      benefits: ['Emotional Balance', 'Intuition', 'Peace', 'Fertility'],
      properties: 'Organic gem, associated with Moon'
    },
    'Emerald': {
      zodiac: ['Taurus', 'Gemini', 'Virgo'],
      benefits: ['Communication', 'Wisdom', 'Growth', 'Harmony'],
      properties: 'Green beryl, associated with Mercury'
    },
    'Diamond': {
      zodiac: ['Aries', 'Leo', 'Libra'],
      benefits: ['Clarity', 'Strength', 'Purity', 'Success'],
      properties: 'Pure carbon, associated with Venus'
    },
    'Sapphire': {
      zodiac: ['Taurus', 'Virgo', 'Capricorn'],
      benefits: ['Wisdom', 'Truth', 'Loyalty', 'Spirituality'],
      properties: 'Blue corundum, associated with Saturn'
    },
    'Amethyst': {
      zodiac: ['Pisces', 'Virgo', 'Aquarius'],
      benefits: ['Spirituality', 'Calmness', 'Protection', 'Healing'],
      properties: 'Purple quartz, associated with Jupiter'
    },
    'Topaz': {
      zodiac: ['Sagittarius', 'Scorpio', 'Gemini'],
      benefits: ['Success', 'Abundance', 'Protection', 'Healing'],
      properties: 'Aluminum silicate, associated with Jupiter'
    },
    'Garnet': {
      zodiac: ['Capricorn', 'Aquarius', 'Aries'],
      benefits: ['Energy', 'Passion', 'Protection', 'Grounding'],
      properties: 'Silicate minerals, associated with Mars'
    },
    'Opal': {
      zodiac: ['Libra', 'Cancer', 'Pisces'],
      benefits: ['Creativity', 'Emotional Balance', 'Intuition', 'Love'],
      properties: 'Hydrated silica, associated with Venus'
    },
    'Turquoise': {
      zodiac: ['Sagittarius', 'Pisces', 'Scorpio'],
      benefits: ['Protection', 'Healing', 'Communication', 'Wisdom'],
      properties: 'Copper aluminum phosphate, associated with Neptune'
    }
  };

  async analyzeAstrologicalCompatibility(profile: AstrologicalProfile): Promise<AstrologicalAnalysis> {
    try {
      const prompt = this.buildAstrologicalPrompt(profile);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAstrologicalResponse(text, profile);
    } catch (error) {
      console.error('Astrological AI Error:', error);
      throw new Error('Failed to analyze astrological compatibility');
    }
  }

  private buildAstrologicalPrompt(profile: AstrologicalProfile): string {
    const { zodiacSign, birthDate, specificConcerns } = profile;
    
    return `You are an expert astrological gemstone consultant. Provide concise, practical advice with NO bold formatting.

Analyze the compatibility between ${zodiacSign} and various gemstones.

CUSTOMER PROFILE:
• Zodiac Sign: ${zodiacSign}
• Birth Date: ${birthDate || 'Not provided'}
• Specific Concerns: ${specificConcerns?.join(', ') || 'General well-being'}

GEMSTONE DATABASE:
${Object.entries(this.gemstoneDatabase).map(([stone, data]) => 
  `${stone}:
   • Zodiac Compatibility: ${data.zodiac.join(', ')}
   • Benefits: ${data.benefits.join(', ')}
   • Properties: ${data.properties}`
).join('\n\n')}

ANALYSIS REQUIREMENTS:
1. Evaluate compatibility for each gemstone (Excellent/Good/Moderate/Avoid)
2. Provide specific reasons for recommendations
3. Suggest alternatives for incompatible stones
4. Include timing advice for wearing stones
5. Give general astrological advice

FORMAT RESPONSE AS:
COMPATIBILITY ANALYSIS:
• [Stone Name] - [Compatibility Level]
  • Benefits: [list]
  • Reasons: [why it's good/bad]
  • Alternatives: [if needed]

TIMING ADVICE:
• [When to wear stones]

GENERAL ADVICE:
• [Astrological recommendations]

CRITICAL FORMATTING RULES:
- Use bullet points (•) ONLY - NO bold text (**), NO asterisks
- NO bold formatting anywhere in the response
- Keep response under 300 words
- Use minimal emojis (max 2-3 total)
- Write in simple, clear language
- Focus on immediate actionable items`;
  }

  private parseAstrologicalResponse(text: string, profile: AstrologicalProfile): AstrologicalAnalysis {
    // Parse the AI response and structure it
    const recommendations: GemstoneRecommendation[] = [];
    const generalAdvice: string[] = [];
    let timing = '';

    // Extract recommendations from the response
    const lines = text.split('\n');
    let currentStone = '';
    
    for (const line of lines) {
      if (line.includes(' - ')) {
        const match = line.match(/(\w+)\s*-\s*(Excellent|Good|Moderate|Avoid)/);
        if (match) {
          currentStone = match[1];
          const compatibility = match[2] as 'Excellent' | 'Good' | 'Moderate' | 'Avoid';
          
          recommendations.push({
            stone: currentStone,
            benefits: this.extractBenefits(text, currentStone),
            compatibility,
            reasons: this.extractReasons(text, currentStone),
            alternatives: this.extractAlternatives(text, currentStone)
          });
        }
      }
      
      if (line.includes('TIMING ADVICE:')) {
        timing = this.extractTiming(text);
      }
      
      if (line.includes('GENERAL ADVICE:')) {
        generalAdvice.push(...this.extractGeneralAdvice(text));
      }
    }

    return {
      profile,
      recommendations,
      generalAdvice,
      timing
    };
  }

  private extractBenefits(text: string, stone: string): string[] {
    const benefits: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes(stone) && line.includes('Benefits:')) {
        const match = line.match(/Benefits:\s*(.+)/);
        if (match) {
          benefits.push(...match[1].split(',').map(b => b.trim()));
        }
      }
    }
    
    return benefits.length > 0 ? benefits : this.gemstoneDatabase[stone as keyof typeof this.gemstoneDatabase]?.benefits || [];
  }

  private extractReasons(text: string, stone: string): string[] {
    const reasons: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes(stone) && line.includes('Reasons:')) {
        const match = line.match(/Reasons:\s*(.+)/);
        if (match) {
          reasons.push(match[1].trim());
        }
      }
    }
    
    return reasons;
  }

  private extractAlternatives(text: string, stone: string): string[] {
    const alternatives: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes(stone) && line.includes('Alternatives:')) {
        const match = line.match(/Alternatives:\s*(.+)/);
        if (match) {
          alternatives.push(...match[1].split(',').map(a => a.trim()));
        }
      }
    }
    
    return alternatives;
  }

  private extractTiming(text: string): string {
    const lines = text.split('\n');
    let timing = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('TIMING ADVICE:')) {
        timing = lines[i + 1]?.trim() || '';
        break;
      }
    }
    
    return timing;
  }

  private extractGeneralAdvice(text: string): string[] {
    const advice: string[] = [];
    const lines = text.split('\n');
    let inAdviceSection = false;
    
    for (const line of lines) {
      if (line.includes('GENERAL ADVICE:')) {
        inAdviceSection = true;
        continue;
      }
      
      if (inAdviceSection && line.trim()) {
        if (line.includes('COMPATIBILITY ANALYSIS:') || line.includes('TIMING ADVICE:')) {
          break;
        }
        advice.push(line.trim());
      }
    }
    
    return advice;
  }

  async getQuickRecommendation(zodiacSign: string, concern: string): Promise<string> {
    try {
      const prompt = `As an astrological gemstone expert, provide a quick recommendation for a ${zodiacSign} who wants to address: ${concern}.

Available gemstones: Ruby, Pearl, Emerald, Diamond, Sapphire, Amethyst, Topaz, Garnet, Opal, Turquoise

Give a brief, practical recommendation in 2-3 sentences. Focus on the best stone for their specific concern.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Quick recommendation error:', error);
      return 'I recommend consulting with a gemstone expert for personalized advice.';
    }
  }
}

export const astrologicalAIService = new AstrologicalAIService();
