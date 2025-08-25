# DevSecOps Chat Assistant 🛡️🤖

A DevSecOps documentation chat assistant with AI integration and specialized knowledge base.

## Quick Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/luciakennedy-mantel/devsecops-sme-chat.git
   cd devsecops-sme-chat
   npm install
   ```

2. **Add your API key**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Start the chat**
   ```bash
   cd ../Cline/MCP/devsecops-docs-server
   npm install
   ./start-chat.sh
   ```
   
   Access at: http://localhost:3001

## Features

- 🤖 **AI Chat** with your own OpenAI API key
- 🌙 **Dark mode interface** with typewriter effect
- 📚 **DevSecOps knowledge base** - CUJs, SLIs, SLOs
- 🎨 **Animated UI** with bouncing robot icons
- 📱 **Mobile responsive**

## Configuration

Edit `.env` file:
```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_BASE_URL=https://api.openai.com/v1
```

## What's Included

- Critical User Journeys (CUJs) templates
- SLI/SLO best practices and examples
- Observability maturity framework
- DevSecOps documentation and guides

Ask questions like:
- "What is a Critical User Journey?"
- "How do I create SLIs for my service?"
- "Show me SLO examples"

---

Ready to use with your own API key! 🚀
