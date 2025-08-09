# Gemini AI Integration Setup

This guide will help you set up the Google Gemini AI integration for your Anantya Stonebook CRM.

## Prerequisites

1. A Google account
2. Access to Google AI Studio (MakerSuite)

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Create API Key"
4. Copy the generated API key

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add your Gemini API key:

```bash
# Copy from env.example and replace with your actual API key
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Step 3: Verify Installation

1. Make sure the `@google/generative-ai` package is installed:
   ```bash
   npm install @google/generative-ai
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Navigate to the AI Analysis page in your application

## Features

The Gemini AI integration provides:

### 🤖 Intelligent Business Analysis
- **Natural Language Queries**: Ask questions about your business in plain English
- **Comprehensive Insights**: Get detailed analysis of sales, inventory, clients, and more
- **Actionable Recommendations**: Receive specific suggestions to improve your business

### 📊 Analysis Capabilities
- **Business Overview**: Get a complete picture of your gemstone business
- **Profit Analysis**: Understand your profit margins and financial performance
- **Client Analysis**: Identify your best customers and their buying patterns
- **Inventory Analysis**: Track stock levels and identify low-stock items
- **Growth Trends**: Analyze sales trends and business growth
- **Certification Status**: Monitor certification processes and deadlines

### 💡 Smart Features
- **Context-Aware Responses**: AI understands your specific business context
- **Structured Data Processing**: Analyzes your actual business data from the database
- **Fallback Support**: Falls back to local analysis if AI is unavailable
- **Real-time Insights**: Provides up-to-date analysis based on current data

## Example Queries

Try asking the AI assistant questions like:

- "Show me my business overview"
- "What's my profit margin this month?"
- "Which clients are my best customers?"
- "How is my inventory performing?"
- "What are the growth trends?"
- "Which gemstones are selling best?"
- "Give me recommendations to improve sales"
- "Analyze my certification status"

## API Endpoints

The integration adds three new API endpoints:

- `POST /api/ai/analyze` - Main analysis endpoint
- `GET /api/ai/insights` - Generate business insights
- `POST /api/ai/recommendations` - Get recommendations for specific areas

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Make sure your `.env` file contains the correct `GEMINI_API_KEY`
2. **Rate Limiting**: The free tier has usage limits. Consider upgrading for higher usage
3. **Network Issues**: Ensure your server can reach Google's AI services

### Error Handling

The system includes fallback mechanisms:
- If Gemini API fails, it falls back to local analysis
- Error messages are logged for debugging
- User-friendly error messages are displayed

## Security Notes

- Never commit your API key to version control
- Use environment variables for configuration
- Monitor API usage to avoid unexpected charges
- Consider implementing rate limiting for production use

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure your environment variables are properly set
4. Check the server logs for detailed error information

## Next Steps

Once the basic integration is working, you can:

1. Customize the AI prompts for your specific business needs
2. Add more specialized analysis functions
3. Implement caching for frequently requested analyses
4. Add user preferences for AI response styles
5. Integrate with other business intelligence tools
