# DevSecOps SME Platform 🛡️🤖

A comprehensive DevSecOps Subject Matter Expert platform featuring an AI-powered documentation assistant with Claude 3.5 Sonnet integration, specialized knowledge base, and interactive chat interface.

## 🌟 Features

### 🤖 AI-Powered Chat Assistant
- **Claude 3.5 Sonnet Integration** via Mantel Group gateway
- **Real-time chat interface** with WebSocket connections
- **Typewriter effect** for engaging response delivery
- **Dark mode design** with animated robot icons
- **Mobile responsive** interface

### 📚 DevSecOps Knowledge Base
- **Critical User Journeys (CUJs)** guidance and templates
- **Service Level Indicators (SLIs) & Objectives (SLOs)** best practices
- **Observability maturity framework** from CBA
- **DevSecOps best practices** and methodologies
- **Enterprise templates** and frameworks

### 🔧 Technical Architecture
- **MCP (Model Context Protocol)** server integration
- **Node.js backend** with Express and Socket.IO
- **Documentation search** and retrieval system
- **Enterprise security** through corporate AI gateway
- **Modular design** with multiple chat interfaces

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Access to Mantel Group AI gateway (for Claude integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devsecops-sme-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the basic platform**
   ```bash
   npm start
   ```

### 🤖 AI Chat Setup (Advanced)

For the full AI-powered experience with Claude 3.5 Sonnet:

1. **Navigate to MCP server directory**
   ```bash
   cd ../Cline/MCP/devsecops-docs-server
   ```

2. **Install MCP server dependencies**
   ```bash
   npm install
   ```

3. **Configure AI settings**
   ```bash
   cp .env.example .env
   # Add your Mantel Group API credentials
   ```

4. **Start the AI chat server**
   ```bash
   ./start-chat.sh
   ```

5. **Access the AI chat interface**
   ```
   http://localhost:3001
   ```

## 📖 Documentation

### Core Components

#### 🎯 Critical User Journeys (CUJs)
- **Definition**: User-focused reliability metrics that measure what matters most to your users
- **Templates**: Ready-to-use CUJ templates for common scenarios
- **Best Practices**: Industry-standard approaches to CUJ implementation

#### 📊 SLIs & SLOs
- **Service Level Indicators**: Quantitative measures of service reliability
- **Service Level Objectives**: Target values for SLIs that define acceptable service performance
- **Templates**: YAML templates for common SLO configurations

#### 👁️ Observability Framework
- **Maturity Levels**: 4-tier observability maturity model (0-3)
- **Implementation Guide**: Step-by-step observability implementation
- **CBA Standards**: Enterprise-specific observability requirements

#### 🔒 DevSecOps Best Practices
- **Security-first development**: Integrating security throughout the development lifecycle
- **Automated security testing**: CI/CD pipeline security integration
- **Compliance frameworks**: Meeting enterprise security requirements

### 🗂️ Project Structure

```
devsecops-sme-platform/
├── README.md                          # This file
├── package.json                       # Node.js dependencies
├── server.js                         # Basic Express server
├── public/                           # Static web assets
│   └── index.html                   # Basic web interface
├── context/                         # Knowledge base
│   ├── docs/                       # Documentation files
│   ├── knowledge-base/             # Curated knowledge
│   └── templates/                  # Ready-to-use templates
├── uploads/                        # File upload directory
└── ../Cline/MCP/devsecops-docs-server/  # AI chat server
    ├── src/                        # MCP server source
    ├── public/                     # AI chat interface
    ├── web-ui-openai.cjs          # Claude integration
    └── start-chat.sh              # Startup script
```

## 🎨 Chat Interface Features

### Visual Design
- **🌙 Dark Mode**: Professional dark theme with GitHub-inspired colors
- **🤖 Animated Icons**: Bouncing robot and shield icons in header
- **✨ Gradient Effects**: Beautiful gradients throughout the interface
- **📱 Responsive**: Perfect on desktop, tablet, and mobile

### Interactive Elements
- **⌨️ Typewriter Effect**: Responses appear character-by-character
- **💬 Real-time Chat**: Instant messaging with WebSocket connections
- **🎯 Smart Suggestions**: Quick-access buttons for common questions
- **🔄 Loading States**: Animated typing indicators and smooth transitions

### User Experience
- **🎪 Engaging Animations**: Subtle, professional animations throughout
- **⚡ Fast Performance**: Optimized for smooth interactions
- **♿ Accessible**: Screen reader friendly with proper focus management
- **🔍 Smart Search**: Integrated documentation search capabilities

## 🛠️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Basic server configuration
PORT=3000
NODE_ENV=development

# AI Chat Configuration (for Claude integration)
OPENAI_API_KEY=your_mantel_group_api_key
OPENAI_BASE_URL=https://ai.mantelgroup.com.au/v1
OPENAI_MODEL=au-claude-3.5-sonnet
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
CHAT_PORT=3001
```

### Available Scripts

```bash
# Start basic platform
npm start

# Start with development mode
npm run dev

# Start AI chat server (from MCP directory)
./start-chat.sh

# Build MCP server
npm run build
```

## 🤝 Usage Examples

### Basic Questions
- "What is a Critical User Journey?"
- "How do I create SLIs for my service?"
- "Show me observability maturity levels"
- "What are DevSecOps best practices?"

### Advanced Queries
- "Help me implement monitoring for microservices"
- "Create a CUJ for user authentication in banking"
- "What SLOs should I set for a payment API?"
- "How do I measure observability maturity?"

## 🔧 Development

### Adding New Documentation
1. Add markdown files to `context/docs/`
2. Update knowledge base in `context/knowledge-base/`
3. Create templates in `context/templates/`
4. Restart the MCP server to index new content

### Customizing the Chat Interface
- Edit `../Cline/MCP/devsecops-docs-server/public/index.html`
- Modify styles, animations, or functionality
- Restart the chat server to see changes

### Extending AI Capabilities
- Update MCP server in `../Cline/MCP/devsecops-docs-server/src/`
- Add new tools or resources
- Rebuild and restart the server

## 🚀 Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use process managers like PM2
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Monitor logs and performance

### Docker Support
```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## 🤖 AI Integration Details

### Claude 3.5 Sonnet Features
- **Advanced reasoning** for complex DevSecOps questions
- **Context awareness** across conversation history
- **Enterprise security** through Mantel Group gateway
- **Australian hosting** for data sovereignty
- **Cost-effective** compared to other enterprise AI solutions

### MCP Server Architecture
- **Documentation indexing** for fast search and retrieval
- **Tool integration** for specialized DevSecOps functions
- **Resource management** for templates and knowledge base
- **Real-time communication** with WebSocket support

## 📊 Knowledge Base Content

### CBA Observability Framework
- **Level 0**: Basic monitoring
- **Level 1**: Structured logging and metrics
- **Level 2**: Distributed tracing and alerting
- **Level 3**: Advanced analytics and ML-driven insights

### DevSecOps Templates
- **CUJ Templates**: JSON templates for common user journeys
- **SLO Templates**: YAML configurations for service objectives
- **Monitoring Templates**: Ready-to-use monitoring configurations
- **Security Templates**: DevSecOps security best practices

## 🔒 Security

### Enterprise Features
- **Corporate AI gateway** integration
- **No data persistence** of sensitive conversations
- **Audit logging** capabilities
- **Role-based access** (configurable)
- **Compliance ready** for enterprise environments

### Best Practices
- Keep `.env` files secure and never commit them
- Use HTTPS in production
- Implement proper authentication
- Regular security updates
- Monitor for vulnerabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Claude 3.5 Sonnet** by Anthropic for AI capabilities
- **Mantel Group** for enterprise AI gateway access
- **Model Context Protocol (MCP)** for extensible AI integration
- **CBA** for observability framework and best practices
- **DevSecOps Community** for knowledge and best practices

## 📞 Support

For questions, issues, or contributions:
- 📧 Create an issue in this repository
- 💬 Use the AI chat interface for DevSecOps questions
- 📚 Check the documentation in the `context/` directory
- 🔍 Search existing issues and discussions

---

**Built with ❤️ for DevSecOps teams everywhere** 🛡️🤖
