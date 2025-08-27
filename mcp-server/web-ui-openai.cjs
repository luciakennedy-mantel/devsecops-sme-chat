#!/usr/bin/env node

/**
 * DevSecOps Documentation Chat with OpenAI Integration
 * Enhanced web interface with conversational AI capabilities
 */

require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const { spawn } = require('child_process')
const OpenAI = require('openai')

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    })
  : null

// Configuration
const PORT = process.env.PORT || 3001
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
const OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000
const OPENAI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7

// Create Express app
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// MCP Server instance
let mcpServer = null
let mcpReady = false

// Initialize MCP Server
function initializeMCPServer() {
  console.log('MCP Server: Starting DevSecOps Documentation server...')

  mcpServer = spawn('node', [path.join(__dirname, 'build/index.js')], {
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  mcpServer.stdout.on('data', (data) => {
    const output = data.toString()
    console.log('MCP Server:', output.trim())

    if (output.includes('DevSecOps Documentation MCP server running')) {
      mcpReady = true
      console.log('MCP Server initialized successfully')
    }
  })

  mcpServer.stderr.on('data', (data) => {
    console.error('MCP Server Error:', data.toString())
  })

  mcpServer.on('close', (code) => {
    console.log(`MCP Server process exited with code ${code}`)
    mcpReady = false
  })

  // Initialize the server
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
      clientInfo: {
        name: 'devsecops-web-ui',
        version: '1.0.0',
      },
    },
  }

  mcpServer.stdin.write(JSON.stringify(initMessage) + '\n')
}

// Query MCP Server
async function queryMCPServer(method, params = {}) {
  return new Promise((resolve, reject) => {
    if (!mcpReady || !mcpServer) {
      reject(new Error('MCP Server not ready'))
      return
    }

    const message = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: method,
      params: params,
    }

    const timeout = setTimeout(() => {
      reject(new Error('MCP Server timeout'))
    }, 10000)

    const handleResponse = (data) => {
      try {
        const lines = data
          .toString()
          .split('\n')
          .filter((line) => line.trim())
        for (const line of lines) {
          const response = JSON.parse(line)
          if (response.id === message.id) {
            clearTimeout(timeout)
            mcpServer.stdout.removeListener('data', handleResponse)
            if (response.error) {
              reject(new Error(response.error.message))
            } else {
              resolve(response.result)
            }
            return
          }
        }
      } catch (error) {
        // Continue listening for more data
      }
    }

    mcpServer.stdout.on('data', handleResponse)
    mcpServer.stdin.write(JSON.stringify(message) + '\n')
  })
}

// Enhanced prompt for DevSecOps context
function createDevSecOpsPrompt(userMessage, searchResults = null) {
  let contextInfo = ''

  if (searchResults && searchResults.length > 0) {
    contextInfo =
      '\n\nRelevant Documentation:\n' +
      searchResults
        .map(
          (result) =>
            `- ${result.title}: ${result.content.substring(0, 200)}...`
        )
        .join('\n')
  }

  return `You are a DevSecOps Subject Matter Expert assistant. You help teams with:

🎯 Critical User Journeys (CUJs) - defining and implementing user-focused reliability metrics
📊 Service Level Indicators (SLIs) and Objectives (SLOs) - measuring and maintaining service quality  
👁️ Observability and Monitoring - implementing comprehensive system visibility
🔒 DevSecOps Best Practices - security-first development and operations
📚 CBA Framework - Commonwealth Bank of Australia's specific methodologies

Guidelines:
- Provide practical, actionable advice
- Reference specific frameworks and templates when relevant
- Use clear examples and step-by-step guidance
- Focus on enterprise-scale implementations
- Maintain a professional but approachable tone

${contextInfo}

User Question: ${userMessage}

Please provide a helpful, detailed response based on DevSecOps best practices and the available documentation.`
}

// Process chat message with OpenAI
async function processWithOpenAI(message, searchResults = null) {
  if (!openai) {
    throw new Error(
      'OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.'
    )
  }

  try {
    const prompt = createDevSecOpsPrompt(message, searchResults)

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a DevSecOps Subject Matter Expert assistant specializing in CUJs, SLIs, SLOs, observability, and enterprise DevSecOps practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: OPENAI_MAX_TOKENS,
      temperature: OPENAI_TEMPERATURE,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error(`OpenAI processing failed: ${error.message}`)
  }
}

// Fallback response for when OpenAI is not available
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('cuj') ||
    lowerMessage.includes('critical user journey')
  ) {
    return `🎯 **Critical User Journeys (CUJs)**

A Critical User Journey represents the most important paths users take through your system. Here's how to get started:

**1. Identify Critical Paths**
- User login and authentication
- Core business transactions
- Data retrieval and processing

**2. Define Success Criteria**
- Response time thresholds
- Error rate limits
- Availability requirements

**3. Implement Monitoring**
- End-to-end journey tracking
- Real-time alerting
- Performance dashboards

For detailed templates and examples, please refer to the CUJ documentation in your knowledge base.`
  }

  if (lowerMessage.includes('sli') || lowerMessage.includes('slo')) {
    return `📊 **Service Level Indicators & Objectives**

**SLIs (Service Level Indicators)** - What you measure:
- Request latency (response time)
- Error rate (% of failed requests)
- Availability (% uptime)
- Throughput (requests per second)

**SLOs (Service Level Objectives)** - Your targets:
- 99.9% availability
- 95% of requests < 200ms
- Error rate < 0.1%

**Implementation Steps:**
1. Choose meaningful SLIs for your service
2. Set realistic SLO targets
3. Implement monitoring and alerting
4. Review and adjust based on data

Would you like specific guidance on implementing SLIs/SLOs for your service?`
  }

  if (
    lowerMessage.includes('observability') ||
    lowerMessage.includes('monitoring')
  ) {
    return `👁️ **Observability & Monitoring**

**The Three Pillars:**
1. **Metrics** - Numerical data about system performance
2. **Logs** - Detailed records of system events
3. **Traces** - Request flow through distributed systems

**Maturity Levels:**
- **Level 0**: Basic monitoring, reactive
- **Level 1**: Proactive monitoring, some automation
- **Level 2**: Advanced analytics, predictive capabilities
- **Level 3**: Full observability, self-healing systems

**Getting Started:**
1. Implement structured logging
2. Set up key performance metrics
3. Add distributed tracing
4. Create meaningful dashboards
5. Configure intelligent alerting

What specific aspect of observability would you like to explore?`
  }

  return `🛡️ **DevSecOps Documentation Assistant**

I can help you with:

🎯 **Critical User Journeys (CUJs)** - Define and monitor user-focused reliability
📊 **SLIs & SLOs** - Measure and maintain service quality
👁️ **Observability** - Implement comprehensive system monitoring
🔒 **DevSecOps Practices** - Security-first development approaches
📚 **CBA Framework** - Enterprise-specific methodologies

**Try asking about:**
- "How do I create a CUJ?"
- "What SLIs should I track?"
- "Observability maturity levels"
- "DevSecOps best practices"

Note: For enhanced conversational responses, please configure your OpenAI API key in the .env file.`
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('chat_message', async (data) => {
    try {
      const { message } = data
      console.log('Received message:', message)

      let response
      let searchResults = null

      // Try to search documentation first
      try {
        if (mcpReady) {
          searchResults = await queryMCPServer('tools/call', {
            name: 'search_docs',
            arguments: {
              query: message,
              max_results: 3,
            },
          })
        }
      } catch (error) {
        console.log('MCP search failed, continuing with OpenAI:', error.message)
      }

      // Process with OpenAI if available, otherwise use fallback
      if (openai) {
        try {
          response = await processWithOpenAI(message, searchResults)
        } catch (error) {
          console.error('OpenAI failed, using fallback:', error.message)
          response = getFallbackResponse(message)
        }
      } else {
        response = getFallbackResponse(message)
      }

      socket.emit('chat_response', { message: response })
    } catch (error) {
      console.error('Chat processing error:', error)
      socket.emit('chat_error', {
        error:
          'Sorry, I encountered an error processing your message. Please try again.',
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start the server
server.listen(PORT, () => {
  console.log(
    `DevSecOps Documentation Chat UI running on http://localhost:${PORT}`
  )
  console.log('Features available:')
  console.log('- Search DevSecOps documentation')
  console.log('- Get CUJ guidance')
  console.log('- Get SLI/SLO recommendations')
  console.log('- Learn about observability maturity')

  if (openai) {
    console.log('- ✅ OpenAI conversational AI enabled')
  } else {
    console.log('- ⚠️  OpenAI not configured - using fallback responses')
    console.log('  To enable AI: Set OPENAI_API_KEY in .env file')
  }
})

// Initialize MCP Server
initializeMCPServer()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...')
  if (mcpServer) {
    mcpServer.kill()
  }
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
