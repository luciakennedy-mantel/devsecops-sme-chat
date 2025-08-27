#!/usr/bin/env node

/**
 * DevSecOps Documentation MCP Server
 *
 * This MCP server provides access to DevSecOps documentation including:
 * - CBA Observability Framework
 * - Critical User Journeys (CUJs)
 * - Service Level Indicators (SLIs) and Objectives (SLOs)
 * - DevSecOps best practices
 * - Templates and examples
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Path to the DevSecOps platform documentation
 */
const DOCS_BASE_PATH = '/Users/luciakennedy/Documents/devsecops-sme-platform'

/**
 * Interface for documentation content
 */
interface DocContent {
  title: string
  content: string
  type: 'markdown' | 'json' | 'pdf' | 'text'
  category: 'framework' | 'template' | 'knowledge' | 'docs'
  lastModified: Date
}

/**
 * In-memory cache of documentation content
 */
const docCache = new Map<string, DocContent>()

/**
 * Load documentation files from the platform
 */
async function loadDocumentation(): Promise<void> {
  const contextPath = path.join(DOCS_BASE_PATH, 'context')

  try {
    await loadDirectoryRecursively(contextPath, 'context')

    // Also load key files from the root
    const rootFiles = [
      'README.md',
      'CONTEXT_GUIDE.md',
      'AI_SETUP_GUIDE.md',
      'CHATBOT_ALTERNATIVES.md',
    ]
    for (const file of rootFiles) {
      const filePath = path.join(DOCS_BASE_PATH, file)
      if (fs.existsSync(filePath)) {
        await loadFile(filePath, file)
      }
    }

    console.error(`Loaded ${docCache.size} documentation files`)
  } catch (error) {
    console.error('Error loading documentation:', error)
  }
}

/**
 * Recursively load files from a directory
 */
async function loadDirectoryRecursively(
  dirPath: string,
  prefix: string
): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    return
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const resourceId = `${prefix}/${entry.name}`

    if (entry.isDirectory()) {
      await loadDirectoryRecursively(fullPath, resourceId)
    } else if (entry.isFile() && isTextFile(entry.name)) {
      await loadFile(fullPath, resourceId)
    }
  }
}

/**
 * Load a single file into the cache
 */
async function loadFile(filePath: string, resourceId: string): Promise<void> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const stats = fs.statSync(filePath)
    const fileType = getFileType(path.extname(filePath))
    const category = getCategory(resourceId)

    docCache.set(resourceId, {
      title: path.basename(filePath),
      content,
      type: fileType,
      category,
      lastModified: stats.mtime,
    })
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error)
  }
}

/**
 * Check if a file is a text file we can process
 */
function isTextFile(filename: string): boolean {
  const textExtensions = [
    '.md',
    '.txt',
    '.json',
    '.yaml',
    '.yml',
    '.js',
    '.py',
    '.sh',
  ]
  return textExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

/**
 * Get file type from extension
 */
function getFileType(extension: string): DocContent['type'] {
  switch (extension.toLowerCase()) {
    case '.md':
      return 'markdown'
    case '.json':
      return 'json'
    case '.pdf':
      return 'pdf'
    default:
      return 'text'
  }
}

/**
 * Categorize content based on path
 */
function getCategory(resourceId: string): DocContent['category'] {
  if (resourceId.includes('template')) return 'template'
  if (resourceId.includes('knowledge-base')) return 'knowledge'
  if (resourceId.includes('docs')) return 'docs'
  return 'framework'
}

/**
 * Search documentation content
 */
function searchDocumentation(
  query: string,
  category?: string
): Array<{ id: string; doc: DocContent; relevance: number }> {
  const results: Array<{ id: string; doc: DocContent; relevance: number }> = []
  const queryLower = query.toLowerCase()

  for (const [id, doc] of docCache.entries()) {
    if (category && doc.category !== category) continue

    let relevance = 0
    const titleLower = doc.title.toLowerCase()
    const contentLower = doc.content.toLowerCase()

    // Title matches are highly relevant
    if (titleLower.includes(queryLower)) relevance += 10

    // Content matches
    const contentMatches = (
      contentLower.match(new RegExp(queryLower, 'g')) || []
    ).length
    relevance += contentMatches

    // Boost relevance for key terms
    const keyTerms = [
      'cuj',
      'sli',
      'slo',
      'observability',
      'devsecops',
      'monitoring',
    ]
    for (const term of keyTerms) {
      if (queryLower.includes(term) && contentLower.includes(term)) {
        relevance += 5
      }
    }

    if (relevance > 0) {
      results.push({ id, doc, relevance })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance)
}

/**
 * Extract relevant snippets from content
 */
function extractSnippets(
  content: string,
  query: string,
  maxSnippets: number = 3
): string[] {
  const sentences = content.split(/[.!?]+/)
  const queryLower = query.toLowerCase()

  return sentences
    .filter((sentence) => sentence.toLowerCase().includes(queryLower))
    .slice(0, maxSnippets)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

/**
 * Create an MCP server for DevSecOps documentation
 */
const server = new Server(
  {
    name: 'devsecops-docs-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
)

/**
 * Handler for listing available documentation resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Array.from(docCache.entries()).map(([id, doc]) => ({
    uri: `devsecops:///${id}`,
    mimeType: doc.type === 'markdown' ? 'text/markdown' : 'text/plain',
    name: doc.title,
    description: `${doc.category}: ${doc.title} (${doc.type})`,
  }))

  return { resources }
})

/**
 * Handler for reading specific documentation content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri)
  const id = url.pathname.replace(/^\//, '')
  const doc = docCache.get(id)

  if (!doc) {
    throw new Error(`Documentation ${id} not found`)
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: doc.type === 'markdown' ? 'text/markdown' : 'text/plain',
        text: doc.content,
      },
    ],
  }
})

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_docs',
        description: 'Search DevSecOps documentation for specific topics',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: "Search query (e.g., 'CUJ', 'observability', 'SLI')",
            },
            category: {
              type: 'string',
              enum: ['framework', 'template', 'knowledge', 'docs'],
              description: 'Optional: Filter by document category',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of results to return (default: 5)',
              minimum: 1,
              maximum: 20,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_cuj_guidance',
        description: 'Get specific guidance on Critical User Journeys',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              enum: ['definition', 'creation', 'examples', 'best_practices'],
              description: 'Type of CUJ guidance needed',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'get_sli_slo_guidance',
        description: 'Get guidance on Service Level Indicators and Objectives',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['sli', 'slo', 'both'],
              description: 'Whether you need SLI, SLO, or both guidance',
            },
            use_case: {
              type: 'string',
              description: 'Optional: Specific use case or application type',
            },
          },
          required: ['type'],
        },
      },
      {
        name: 'get_observability_maturity',
        description: 'Get information about CBA observability maturity levels',
        inputSchema: {
          type: 'object',
          properties: {
            level: {
              type: 'number',
              enum: [0, 1, 2, 3],
              description: 'Optional: Specific maturity level (0-3)',
            },
          },
        },
      },
    ],
  }
})

/**
 * Handler for tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'search_docs': {
      const query = String(request.params.arguments?.query || '')
      const category = request.params.arguments?.category as string | undefined
      const maxResults = Number(request.params.arguments?.max_results || 5)

      if (!query) {
        throw new Error('Search query is required')
      }

      const results = searchDocumentation(query, category).slice(0, maxResults)

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No documentation found for query: "${query}"`,
            },
          ],
        }
      }

      const response = results
        .map(({ id, doc, relevance }) => {
          const snippets = extractSnippets(doc.content, query)
          return (
            `**${doc.title}** (${doc.category})\n` +
            `Relevance: ${relevance}\n` +
            (snippets.length > 0
              ? `Snippets:\n${snippets.map((s) => `- ${s}`).join('\n')}\n`
              : '') +
            `Resource: devsecops:///${id}\n`
          )
        })
        .join('\n---\n\n')

      return {
        content: [
          {
            type: 'text',
            text: `Found ${results.length} results for "${query}":\n\n${response}`,
          },
        ],
      }
    }

    case 'get_cuj_guidance': {
      const topic = String(request.params.arguments?.topic || 'definition')

      const cujGuidance = {
        definition:
          'Critical User Journeys (CUJs) represent end-to-end workflows that deliver business value to your customers. They focus on user-impacting paths through your system, not just technical processes.',
        creation:
          'To create CUJs: 1) Identify your customers (end users, other apps, other teams), 2) Map the journey from entry to exit, 3) Focus on business value delivery, 4) Ensure segments are independently measurable.',
        examples:
          "Example CUJ: 'Customer places order → Payment processed → Order confirmed → Delivery scheduled'. Each segment can be measured independently for better observability.",
        best_practices:
          'CUJ Best Practices: Focus on segments where your application operates independently, align with business outcomes, keep them measurable, and use them to drive your SLI/SLO strategy.',
      }

      return {
        content: [
          {
            type: 'text',
            text:
              cujGuidance[topic as keyof typeof cujGuidance] ||
              cujGuidance.definition,
          },
        ],
      }
    }

    case 'get_sli_slo_guidance': {
      const type = String(request.params.arguments?.type || 'both')
      const useCase = String(request.params.arguments?.use_case || '')

      let guidance = ''

      if (type === 'sli' || type === 'both') {
        guidance += '**SLIs (Service Level Indicators):**\n'
        guidance += '- Measure what users actually experience\n'
        guidance +=
          '- Focus on availability, latency, error rates, throughput\n'
        guidance += "- Ask: 'What would users notice if this went wrong?'\n"
        guidance += '- Measure what YOU control, not external dependencies\n\n'
      }

      if (type === 'slo' || type === 'both') {
        guidance += '**SLOs (Service Level Objectives):**\n'
        guidance += '- Define reliability targets for your SLIs\n'
        guidance +=
          '- Start with achievable targets based on current performance\n'
        guidance += '- Use error budgets to balance reliability vs features\n'
        guidance += '- Review and adjust monthly\n\n'
      }

      if (useCase) {
        guidance += `**For ${useCase}:**\n`
        guidance +=
          'Consider metrics like success rates, response times, and availability that directly impact user experience.\n'
      }

      return {
        content: [
          {
            type: 'text',
            text: guidance,
          },
        ],
      }
    }

    case 'get_observability_maturity': {
      const level = request.params.arguments?.level as number | undefined

      const maturityLevels = {
        0: '**Level 0 - No Visibility:** No systematic monitoring or logging. Issues discovered by users.',
        1: '**Level 1 - Basic Logging:** Basic application and infrastructure logging. Reactive problem-solving.',
        2: '**Level 2 - Structured Monitoring:** Organized metrics, dashboards, and alerts. Proactive monitoring begins.',
        3: '**Level 3 - Advanced Observability:** Predictive monitoring, user-focused metrics, full observability stack.',
      }

      if (level !== undefined) {
        return {
          content: [
            {
              type: 'text',
              text:
                maturityLevels[level as keyof typeof maturityLevels] ||
                'Invalid maturity level',
            },
          ],
        }
      }

      const allLevels = Object.entries(maturityLevels)
        .map(([lvl, desc]) => desc)
        .join('\n\n')

      return {
        content: [
          {
            type: 'text',
            text: `**CBA Observability Maturity Levels:**\n\n${allLevels}\n\nThe goal is to progress from reactive (Level 0-1) to proactive (Level 2-3) observability.`,
          },
        ],
      }
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

/**
 * Handler for listing available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'analyze_devsecops_setup',
        description:
          'Analyze current DevSecOps setup and provide recommendations',
      },
      {
        name: 'create_cuj_template',
        description:
          'Create a Critical User Journey template for a specific application',
      },
      {
        name: 'sli_slo_recommendations',
        description: 'Get SLI/SLO recommendations based on application type',
      },
    ],
  }
})

/**
 * Handler for prompt requests
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const promptName = request.params.name

  switch (promptName) {
    case 'analyze_devsecops_setup':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: 'Based on the DevSecOps documentation available, analyze the current setup and provide specific recommendations for improvement. Consider observability maturity, CUJ implementation, SLI/SLO strategy, and security practices.',
            },
          },
        ],
      }

    case 'create_cuj_template':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: 'Using the CBA framework and available templates, help create a Critical User Journey template. Ask about the application type, key user workflows, and business value delivery to create a comprehensive CUJ definition.',
            },
          },
        ],
      }

    case 'sli_slo_recommendations':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: 'Based on the SLI/SLO guidance in the documentation, provide specific recommendations for Service Level Indicators and Objectives. Consider the application type, user impact, and current observability maturity level.',
            },
          },
        ],
      }

    default:
      throw new Error(`Unknown prompt: ${promptName}`)
  }
})

/**
 * Start the server
 */
async function main() {
  // Load documentation on startup
  await loadDocumentation()

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('DevSecOps Documentation MCP server running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
