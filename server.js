const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { spawn } = require('child_process')
const cors = require('cors')
const pdfParse = require('pdf-parse')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload = multer({ storage: storage })

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir('uploads', { recursive: true })
  } catch (error) {
    console.error('Error creating uploads directory:', error)
  }
}

// DevSecOps Knowledge Base (in-memory for this demo)
class DevSecOpsKnowledgeBase {
  constructor() {
    this.pdfContents = new Map()
    this.knowledgeBase = {
      cujs: [],
      slis: [],
      slos: [],
      bestPractices: [],
      riskAssessments: [],
    }
  }

  async processPDF(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath)
      const pdfData = await pdfParse(fileBuffer)

      const filename = path.basename(filePath)
      const content = pdfData.text

      // Store PDF content
      this.pdfContents.set(filename, {
        filename,
        content,
        extractedAt: new Date().toISOString(),
      })

      // Extract DevSecOps-related content
      await this.extractDevSecOpsContent(content)

      return {
        success: true,
        filename,
        contentLength: content.length,
        extractedAt: new Date().toISOString(),
        summary: `Successfully processed ${filename}. Extracted ${content.length} characters of content.`,
        extractedConcepts: {
          cujs: this.knowledgeBase.cujs.length,
          slis: this.knowledgeBase.slis.length,
          slos: this.knowledgeBase.slos.length,
          bestPractices: this.knowledgeBase.bestPractices.length,
        },
      }
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error.message}`)
    }
  }

  async extractDevSecOpsContent(content) {
    // Extract CUJs
    const cujPatterns = [
      /critical user journey[s]?[:\-\s]([^.!?]*)/gi,
      /cuj[s]?[:\-\s]([^.!?]*)/gi,
      /user journey[s]?[:\-\s]([^.!?]*)/gi,
    ]

    cujPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          if (!this.knowledgeBase.cujs.includes(match.trim())) {
            this.knowledgeBase.cujs.push(match.trim())
          }
        })
      }
    })

    // Extract SLIs
    const sliPatterns = [
      /service level indicator[s]?[:\-\s]([^.!?]*)/gi,
      /sli[s]?[:\-\s]([^.!?]*)/gi,
      /indicator[s]?[:\-\s]([^.!?]*)/gi,
    ]

    sliPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          if (!this.knowledgeBase.slis.includes(match.trim())) {
            this.knowledgeBase.slis.push(match.trim())
          }
        })
      }
    })

    // Extract SLOs
    const sloPatterns = [
      /service level objective[s]?[:\-\s]([^.!?]*)/gi,
      /slo[s]?[:\-\s]([^.!?]*)/gi,
      /objective[s]?[:\-\s]([^.!?]*)/gi,
    ]

    sloPatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          if (!this.knowledgeBase.slos.includes(match.trim())) {
            this.knowledgeBase.slos.push(match.trim())
          }
        })
      }
    })

    // Extract best practices
    const bestPracticePatterns = [
      /best practice[s]?[:\-\s]([^.!?]*)/gi,
      /recommendation[s]?[:\-\s]([^.!?]*)/gi,
      /should[:\-\s]([^.!?]*)/gi,
    ]

    bestPracticePatterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          if (!this.knowledgeBase.bestPractices.includes(match.trim())) {
            this.knowledgeBase.bestPractices.push(match.trim())
          }
        })
      }
    })
  }

  getDevSecOpsRecommendations(context) {
    const contextLower = context.toLowerCase()
    const recommendations = []

    // Generate context-specific recommendations
    if (contextLower.includes('security')) {
      recommendations.push(
        'Implement security scanning in CI/CD pipeline',
        'Regular vulnerability assessments',
        'Zero-trust architecture principles',
        'Secure coding practices training'
      )
    }

    if (contextLower.includes('monitoring')) {
      recommendations.push(
        'Implement comprehensive observability',
        'Set up alerting for critical metrics',
        'Monitor user journey performance',
        'Track SLI/SLO compliance'
      )
    }

    if (contextLower.includes('deployment')) {
      recommendations.push(
        'Blue-green deployment strategy',
        'Automated rollback mechanisms',
        'Feature flags for controlled releases',
        'Infrastructure as Code (IaC)'
      )
    }

    // Add recommendations from knowledge base
    const relevantPractices = this.knowledgeBase.bestPractices.filter(
      (practice) => practice.toLowerCase().includes(contextLower)
    )

    recommendations.push(...relevantPractices)

    return {
      context,
      recommendations,
      totalRecommendations: recommendations.length,
      source: 'DevSecOps SME Knowledge Base',
    }
  }

  searchKnowledgeBase(query, category = 'all') {
    const queryLower = query.toLowerCase()
    const results = {}

    if (category === 'all' || category === 'cujs') {
      results.cujs = this.knowledgeBase.cujs.filter((cuj) =>
        cuj.toLowerCase().includes(queryLower)
      )
    }

    if (category === 'all' || category === 'slis') {
      results.slis = this.knowledgeBase.slis.filter((sli) =>
        sli.toLowerCase().includes(queryLower)
      )
    }

    if (category === 'all' || category === 'slos') {
      results.slos = this.knowledgeBase.slos.filter((slo) =>
        slo.toLowerCase().includes(queryLower)
      )
    }

    if (category === 'all' || category === 'best-practices') {
      results.bestPractices = this.knowledgeBase.bestPractices.filter(
        (practice) => practice.toLowerCase().includes(queryLower)
      )
    }

    if (category === 'all' || category === 'pdfs') {
      results.pdfMatches = Array.from(this.pdfContents.entries())
        .filter(
          ([filename, content]) =>
            filename.toLowerCase().includes(queryLower) ||
            content.content.toLowerCase().includes(queryLower)
        )
        .map(([filename, content]) => ({
          filename,
          extractedAt: content.extractedAt,
          relevantSnippets: this.extractRelevantSnippets(
            content.content,
            query
          ),
        }))
    }

    const totalMatches = Object.values(results).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    )

    return {
      query,
      category,
      results,
      totalMatches,
      searchedAt: new Date().toISOString(),
    }
  }

  extractRelevantSnippets(content, query, maxSnippets = 3) {
    const sentences = content.split(/[.!?]+/)
    const relevantSentences = sentences
      .filter((sentence) =>
        sentence.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, maxSnippets)
      .map((sentence) => sentence.trim())

    return relevantSentences
  }
}

// Initialize knowledge base
const knowledgeBase = new DevSecOpsKnowledgeBase()

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// API Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const result = await knowledgeBase.processPDF(req.file.path)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/knowledge-base/:type', (req, res) => {
  const { type } = req.params

  switch (type) {
    case 'cujs':
      res.json({
        cujs: knowledgeBase.knowledgeBase.cujs,
        count: knowledgeBase.knowledgeBase.cujs.length,
        lastUpdated: new Date().toISOString(),
      })
      break
    case 'slis':
      res.json({
        slis: knowledgeBase.knowledgeBase.slis,
        count: knowledgeBase.knowledgeBase.slis.length,
        lastUpdated: new Date().toISOString(),
      })
      break
    case 'slos':
      res.json({
        slos: knowledgeBase.knowledgeBase.slos,
        count: knowledgeBase.knowledgeBase.slos.length,
        lastUpdated: new Date().toISOString(),
      })
      break
    case 'best-practices':
      res.json({
        bestPractices: knowledgeBase.knowledgeBase.bestPractices,
        count: knowledgeBase.knowledgeBase.bestPractices.length,
        lastUpdated: new Date().toISOString(),
      })
      break
    default:
      res.status(404).json({ error: 'Knowledge base type not found' })
  }
})

app.post('/api/search', (req, res) => {
  const { query, category } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query is required' })
  }

  const results = knowledgeBase.searchKnowledgeBase(query, category)
  res.json(results)
})

app.post('/api/recommendations', (req, res) => {
  const { context } = req.body

  if (!context) {
    return res.status(400).json({ error: 'Context is required' })
  }

  const recommendations = knowledgeBase.getDevSecOpsRecommendations(context)
  res.json(recommendations)
})

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('chat_message', async (data) => {
    const { message, type } = data

    try {
      let response

      switch (type) {
        case 'search':
          response = knowledgeBase.searchKnowledgeBase(message)
          break
        case 'recommendations':
          response = knowledgeBase.getDevSecOpsRecommendations(message)
          break
        case 'cujs':
          response = {
            cujs: knowledgeBase.knowledgeBase.cujs,
            count: knowledgeBase.knowledgeBase.cujs.length,
          }
          break
        case 'slis':
          response = {
            slis: knowledgeBase.knowledgeBase.slis,
            count: knowledgeBase.knowledgeBase.slis.length,
          }
          break
        case 'slos':
          response = {
            slos: knowledgeBase.knowledgeBase.slos,
            count: knowledgeBase.knowledgeBase.slos.length,
          }
          break
        default:
          // General query - search across all categories
          response = knowledgeBase.searchKnowledgeBase(message)
      }

      // Enhanced response formatting
      if (response && typeof response === 'object') {
        // Add helpful context if no results found
        if (
          response.totalMatches === 0 ||
          (response.cujs &&
            response.cujs.length === 0 &&
            response.slis &&
            response.slis.length === 0 &&
            response.slos &&
            response.slos.length === 0)
        ) {
          response.helpfulMessage = `No specific matches found for "${message}". Try uploading relevant PDFs or asking about general DevSecOps topics like security, monitoring, or deployment practices.`
        }
      }

      socket.emit('chat_response', {
        message: response,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Chat error:', error)
      socket.emit('chat_error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Initialize server
const startServer = async () => {
  await ensureUploadsDir()

  server.listen(PORT, () => {
    console.log(`DevSecOps SME Platform running on http://localhost:${PORT}`)
    console.log('Features available:')
    console.log('- PDF Upload and Processing')
    console.log('- Real-time Chat Interface')
    console.log('- DevSecOps Knowledge Base')
    console.log('- CUJ/SLI/SLO Analysis')
  })
}

startServer().catch(console.error)
