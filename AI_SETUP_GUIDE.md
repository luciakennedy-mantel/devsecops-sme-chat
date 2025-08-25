# AI-Enhanced DevSecOps SME Platform Setup Guide

## Overview

This enhanced version transforms your DevSecOps platform into a conversational AI assistant that can:
- Have natural conversations about DevSecOps topics
- Provide context-aware responses using your uploaded PDFs and context files
- Integrate with OpenAI or Anthropic for advanced AI capabilities
- Fall back to local knowledge-based responses when AI services aren't available

## Quick Start (Local Mode)

The platform works immediately without any AI API keys:

```bash
# Start with local AI responses (no setup required)
node ai-chat-server.js
```

This provides intelligent DevSecOps responses based on:
- Your CBA Observability Framework
- Uploaded PDF content
- Context files from your `/context/` directory
- Built-in DevSecOps expertise

## AI Service Integration

### Option 1: OpenAI Integration (Recommended)

1. **Get OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create account and generate API key
   - Note: Requires payment setup for API usage

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your key
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Install dotenv package**
   ```bash
   npm install dotenv
   ```

4. **Update ai-chat-server.js to load environment**
   Add this line at the top of ai-chat-server.js:
   ```javascript
   require('dotenv').config()
   ```

### Option 2: Anthropic Integration

1. **Get Anthropic API Key**
   - Visit: https://console.anthropic.com/
   - Create account and generate API key

2. **Configure Environment**
   ```bash
   # Edit .env and add your key
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

### Option 3: Both Services (Automatic Fallback)

Configure both API keys for maximum reliability:
```bash
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

The system will use OpenAI first, then Anthropic, then local responses.

## Enhanced Features

### 1. Context-Aware Responses
The AI assistant automatically includes:
- Your CBA Observability Framework knowledge
- Content from uploaded PDFs
- All files in your `/context/` directory
- Current knowledge base statistics

### 2. Conversational Interface
Unlike the previous search-based system, this provides:
- Natural language conversations
- Follow-up questions and clarifications
- Contextual recommendations
- Personalized advice based on your specific setup

### 3. Smart Topic Detection
The system recognizes when you're asking about:
- Critical User Journeys (CUJs)
- Service Level Indicators (SLIs)
- Service Level Objectives (SLOs)
- Observability and monitoring
- DevSecOps security practices
- General DevSecOps topics

## Usage Examples

### Basic Conversation
```
User: "How do I start with observability?"
AI: "Based on the CBA framework, I'd recommend starting with understanding your current maturity level. What observability practices do you currently have in place?"
```

### Context-Aware Responses
```
User: "What CUJs do I have?"
AI: "You currently have 3 CUJs in your knowledge base: [lists your actual CUJs from uploaded PDFs]"
```

### Technical Guidance
```
User: "Help me define SLIs for a payment system"
AI: "For payment systems, focus on user-impacting SLIs like payment success rate, processing latency, and account validation response time. Based on your CBA framework, these should measure what users would notice if something went wrong..."
```

## File Structure

```
devsecops-sme-platform/
├── ai-chat-server.js          # Enhanced AI-powered server
├── server.js                  # Original server (still available)
├── .env.example              # Environment template
├── .env                      # Your actual environment (create this)
├── context/                  # Your context files (auto-loaded)
│   ├── knowledge-base/       # CBA framework and knowledge
│   ├── templates/           # CUJ and SLO templates
│   └── docs/               # Documentation
├── public/                  # Web interface
└── uploads/                # PDF uploads
```

## Running the Enhanced Platform

### Development Mode
```bash
# With AI services
node ai-chat-server.js

# Check the console output to see which AI provider is active
```

### Production Mode
```bash
# Set environment variables
export OPENAI_API_KEY=your_key_here
export PORT=3000

# Start server
node ai-chat-server.js
```

## Troubleshooting

### AI Service Issues
- **No AI responses**: Check API keys in `.env` file
- **Rate limiting**: AI services have usage limits
- **Network errors**: AI services require internet connection
- **Fallback mode**: System automatically uses local responses if AI fails

### Context Loading Issues
- **Missing context**: Ensure `/context/` directory exists
- **File not found**: Check file permissions and paths
- **PDF processing**: Ensure PDFs are uploaded successfully

## Cost Considerations

### OpenAI Pricing (approximate)
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average conversation: ~$0.01-0.05
- Monthly usage (moderate): ~$10-50

### Anthropic Pricing (approximate)
- Claude-3-Sonnet: ~$0.003 per 1K tokens
- Similar cost structure to OpenAI

### Local Mode
- **Free**: No external API costs
- **Offline**: Works without internet
- **Privacy**: All data stays local

## Security Notes

- **API Keys**: Never commit `.env` files to version control
- **Local Data**: PDFs and context files remain on your server
- **AI Privacy**: Check AI provider privacy policies for your use case
- **Network**: AI services require HTTPS connections

## Next Steps

1. **Start Local**: Test with local responses first
2. **Add AI**: Configure API keys for enhanced conversations
3. **Upload Content**: Add your PDFs and context files
4. **Customize**: Modify responses and add domain-specific knowledge
5. **Deploy**: Set up production environment with proper security

## Support

The system provides multiple fallback layers:
1. **AI Service** (OpenAI/Anthropic) - Best conversational experience
2. **Local AI** - Smart topic-based responses
3. **Knowledge Search** - Structured data retrieval
4. **Static Responses** - Always-available basic help

This ensures your DevSecOps SME platform is always functional, regardless of external service availability.
