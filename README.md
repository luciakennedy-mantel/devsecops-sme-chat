# DevSecOps SME Platform 🛡️🤖

A DevSecOps Subject Matter Expert platform with AI-powered documentation assistant featuring Claude 3.5 Sonnet integration and specialized knowledge base.

## Features

- 🤖 **AI Chat Assistant** with Claude 3.5 Sonnet via Mantel Group gateway
- 🌙 **Dark mode interface** with typewriter effect and animated robot icons
- 📚 **DevSecOps Knowledge Base** - CUJs, SLIs, SLOs, observability best practices
- 🔧 **MCP server integration** for extensible AI capabilities
- 📱 **Mobile responsive** design

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the basic platform**
   ```bash
   npm start
   ```
   Access at: http://localhost:3000

3. **For AI Chat (Advanced)**
   ```bash
   cd ../Cline/MCP/devsecops-docs-server
   npm install
   ./start-chat.sh
   ```
   Access AI chat at: http://localhost:3001

## What's Included

- **Critical User Journeys (CUJs)** templates and guidance
- **SLI/SLO best practices** and templates
- **Observability maturity framework** from CBA
- **DevSecOps documentation** and methodologies
- **Interactive AI assistant** for DevSecOps questions

## Usage

Ask the AI assistant questions like:
- "What is a Critical User Journey?"
- "How do I create SLIs for my service?"
- "Show me observability maturity levels"
- "What are DevSecOps best practices?"

## Configuration

Copy `.env.example` to `.env` and configure your settings for AI integration.

---

Built for DevSecOps teams 🛡️
