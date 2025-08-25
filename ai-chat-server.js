require('dotenv').config()

const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
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

// AI Service Integration
class AIService {
  constructor() {
    this.providers = {
      openai: {
        available: !!process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
      },
      anthropic: {
        available: !!process.env.ANTHROPIC_API_KEY,
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229',
      },
      local: {
        available: true, // Always available as fallback
        endpoint: null,
        model: 'local-knowledge-base',
      },
    }

    this.selectedProvider = this.getAvailableProvider()
    console.log(
      `AI Service initialized with provider: ${this.selectedProvider}`
    )
  }

  getAvailableProvider() {
    if (this.providers.openai.available) return 'openai'
    if (this.providers.anthropic.available) return 'anthropic'
    return 'local'
  }

  async generateResponse(message, context = {}) {
    try {
      switch (this.selectedProvider) {
        case 'openai':
          return await this.callOpenAI(message, context)
        case 'anthropic':
          return await this.callAnthropic(message, context)
        default:
          return await this.generateLocalResponse(message, context)
      }
    } catch (error) {
      console.error('AI Service error:', error)
      return await this.generateLocalResponse(message, context)
    }
  }

  async callOpenAI(message, context) {
    const systemPrompt = this.buildSystemPrompt(context)

    const response = await fetch(this.providers.openai.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.providers.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callAnthropic(message, context) {
    const systemPrompt = this.buildSystemPrompt(context)

    const response = await fetch(this.providers.anthropic.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.providers.anthropic.model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()
    return data.content[0].text
  }

  async generateLocalResponse(message, context) {
    // Enhanced local response with deep context awareness
    const messageLower = message.toLowerCase()
    const knowledgeBase = context.knowledgeBase || {}
    const contextFiles = context.contextFiles || []

    // Analyze message intent and context
    const intent = this.analyzeIntent(messageLower)
    const contextInfo = this.extractContextInfo(contextFiles, knowledgeBase)

    // Generate contextual response based on intent
    switch (intent.primary) {
      case 'cuj':
        return this.generateAdvancedCUJResponse(message, intent, contextInfo)
      case 'sli':
        return this.generateAdvancedSLIResponse(message, intent, contextInfo)
      case 'slo':
        return this.generateAdvancedSLOResponse(message, intent, contextInfo)
      case 'observability':
        return this.generateAdvancedObservabilityResponse(
          message,
          intent,
          contextInfo
        )
      case 'security':
        return this.generateAdvancedSecurityResponse(
          message,
          intent,
          contextInfo
        )
      case 'implementation':
        return this.generateImplementationResponse(message, intent, contextInfo)
      case 'comparison':
        return this.generateComparisonResponse(message, intent, contextInfo)
      case 'troubleshooting':
        return this.generateTroubleshootingResponse(
          message,
          intent,
          contextInfo
        )
      default:
        return this.generateAdvancedGeneralResponse(
          message,
          intent,
          contextInfo
        )
    }
  }

  analyzeIntent(messageLower) {
    const intents = {
      primary: 'general',
      secondary: [],
      questionType: 'general',
      specificity: 'general',
    }

    // Primary topic detection
    if (
      messageLower.includes('cuj') ||
      messageLower.includes('critical user journey') ||
      messageLower.includes('user journey')
    ) {
      intents.primary = 'cuj'
    } else if (
      messageLower.includes('sli') ||
      messageLower.includes('service level indicator') ||
      messageLower.includes('indicator')
    ) {
      intents.primary = 'sli'
    } else if (
      messageLower.includes('slo') ||
      messageLower.includes('service level objective') ||
      messageLower.includes('objective')
    ) {
      intents.primary = 'slo'
    } else if (
      messageLower.includes('observability') ||
      messageLower.includes('monitoring') ||
      messageLower.includes('metrics')
    ) {
      intents.primary = 'observability'
    } else if (
      messageLower.includes('security') ||
      messageLower.includes('devsecops') ||
      messageLower.includes('vulnerability')
    ) {
      intents.primary = 'security'
    } else if (
      messageLower.includes('implement') ||
      messageLower.includes('setup') ||
      messageLower.includes('configure')
    ) {
      intents.primary = 'implementation'
    } else if (
      messageLower.includes('difference') ||
      messageLower.includes('compare') ||
      messageLower.includes('vs')
    ) {
      intents.primary = 'comparison'
    } else if (
      messageLower.includes('problem') ||
      messageLower.includes('issue') ||
      messageLower.includes('troubleshoot') ||
      messageLower.includes('debug')
    ) {
      intents.primary = 'troubleshooting'
    }

    // Question type detection
    if (
      messageLower.startsWith('how') ||
      messageLower.includes('how do') ||
      messageLower.includes('how to')
    ) {
      intents.questionType = 'how'
    } else if (
      messageLower.startsWith('what') ||
      messageLower.includes('what is') ||
      messageLower.includes('what are')
    ) {
      intents.questionType = 'what'
    } else if (
      messageLower.startsWith('why') ||
      messageLower.includes('why should')
    ) {
      intents.questionType = 'why'
    } else if (
      messageLower.startsWith('when') ||
      messageLower.includes('when to')
    ) {
      intents.questionType = 'when'
    } else if (
      messageLower.includes('best practice') ||
      messageLower.includes('recommend')
    ) {
      intents.questionType = 'recommendation'
    }

    // Specificity detection
    if (
      messageLower.includes('start') ||
      messageLower.includes('begin') ||
      messageLower.includes('getting started')
    ) {
      intents.specificity = 'beginner'
    } else if (
      messageLower.includes('advanced') ||
      messageLower.includes('complex') ||
      messageLower.includes('detailed')
    ) {
      intents.specificity = 'advanced'
    } else if (
      messageLower.includes('example') ||
      messageLower.includes('sample')
    ) {
      intents.specificity = 'example'
    }

    return intents
  }

  extractContextInfo(contextFiles, knowledgeBase) {
    return {
      cbaFramework: {
        maturityLevels: [
          'No visibility',
          'Basic logging',
          'Structured monitoring',
          'Advanced observability',
        ],
        tools: [
          'Observe (logging)',
          'Obstack (metrics)',
          'PagerDuty (alerting)',
        ],
        approach: 'metrics-driven observability',
      },
      currentKnowledge: {
        cujs: knowledgeBase.cujs?.length || 0,
        slis: knowledgeBase.slis?.length || 0,
        slos: knowledgeBase.slos?.length || 0,
        bestPractices: knowledgeBase.bestPractices?.length || 0,
      },
      contextFiles: contextFiles.length || 0,
    }
  }

  buildSystemPrompt(context) {
    const knowledgeBase = context.knowledgeBase || {}
    const cbaFramework = context.cbaFramework || {}

    return `You are a DevSecOps Subject Matter Expert (SME) assistant specializing in Critical User Journeys (CUJs), Service Level Indicators (SLIs), and Service Level Objectives (SLOs).

Your expertise includes:
- DevSecOps best practices and methodologies
- Observability and monitoring strategies
- CUJ analysis and definition
- SLI/SLO implementation and management
- Security integration in CI/CD pipelines
- CBA Observability Framework (4-level maturity model)

Current Knowledge Base:
- CUJs: ${knowledgeBase.cujs?.length || 0} items
- SLIs: ${knowledgeBase.slis?.length || 0} items  
- SLOs: ${knowledgeBase.slos?.length || 0} items
- Best Practices: ${knowledgeBase.bestPractices?.length || 0} items

CBA Framework Context:
- Focus on metrics-driven observability
- Shift from logs to metrics approach
- 4-level maturity progression (0-3)
- Tools: Observe (logging), Obstack (metrics), PagerDuty (alerting)

Respond in a conversational, helpful manner. Provide practical advice and actionable recommendations. When discussing technical concepts, explain them clearly and provide examples when relevant.`
  }

  generateCUJResponse(context) {
    const responses = [
      "Critical User Journeys (CUJs) are end-to-end workflows that represent how users interact with your system. They help identify what's most important to measure and monitor.",
      'When defining CUJs, start by identifying your customers (end users, other apps, other teams), then map the journey from entry to exit points, including all dependencies.',
      "A good CUJ should focus on business value delivery. For example, in payments: 'User initiates payment → Account validation → Payment processing → Confirmation delivered'.",
      'Based on the CBA framework, CUJs should drive your SLI/SLO strategy. Focus on the segments where your application operates independently for the most actionable metrics.',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateSLIResponse(context) {
    const responses = [
      'Service Level Indicators (SLIs) are specific metrics that reflect the health of your Critical User Journeys. They should be measurable and directly tied to user experience.',
      "Good SLIs focus on what matters to users: availability, latency, error rates, and throughput. For example: 'Payment success rate' or '95th percentile response time'.",
      "When choosing SLIs, ask: 'What would users notice if this went wrong?' This helps ensure your metrics align with actual user impact.",
      'SLIs should be based on your internal deliverables - things your application controls directly, not external dependencies.',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateSLOResponse(context) {
    const responses = [
      "Service Level Objectives (SLOs) are targets for your SLIs. They define what 'good enough' looks like and help balance reliability with feature velocity.",
      'Start with achievable SLO targets based on current performance, then iterate. A 99.9% availability SLO means you have about 43 minutes of downtime per month.',
      'SLOs should align with business requirements. Work with stakeholders to understand what level of service is actually needed - not everything needs 99.99% uptime.',
      "Error budgets from SLOs help make data-driven decisions about when to focus on reliability vs new features. When you're burning budget too fast, it's time to slow down and fix things.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateObservabilityResponse(context) {
    const responses = [
      'The CBA framework emphasizes shifting from logs to metrics for proactive monitoring. Logs are great for diagnosis, but metrics provide real-time insights into application health.',
      'Observability maturity progresses through 4 levels: No visibility → Basic logging → Structured monitoring → Advanced observability with predictive capabilities.',
      "Focus on application-level observability, not just infrastructure. Ask: 'Is my application doing what it's supposed to do?' rather than just 'Are my servers running?'",
      'Good observability combines metrics (Obstack), logs (Observe), and alerts (PagerDuty) to give you a complete picture of system health and user experience.',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateSecurityResponse(context) {
    const responses = [
      'DevSecOps is about shifting security left - integrating security practices early in the development lifecycle rather than as an afterthought.',
      'Key practices include: automated security scanning in CI/CD, threat modeling during design, secure coding practices, and runtime protection.',
      'Security SLIs might include: vulnerability remediation time, security scan coverage, failed authentication rates, or security incident response time.',
      "Remember: security isn't just about tools, it's about culture. Train developers, establish security champions, and make security everyone's responsibility.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  generateGeneralResponse(message, context) {
    const responses = [
      "I'm here to help with DevSecOps, observability, and SLI/SLO topics. What specific area would you like to explore?",
      "That's an interesting question! Could you provide more context about your specific use case or challenge?",
      "Based on the CBA observability framework, I'd recommend starting with understanding your current maturity level. What observability practices do you currently have in place?",
      "Let's break this down step by step. Are you looking for guidance on CUJs, SLIs, SLOs, or general DevSecOps practices?",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Advanced response methods for enhanced local AI
  generateAdvancedCUJResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent
    const { cbaFramework, currentKnowledge } = contextInfo

    if (questionType === 'how' && specificity === 'beginner') {
      return `Great question! Let me walk you through getting started with Critical User Journeys (CUJs).

**Step 1: Identify Your Customers**
Based on the CBA framework, start by identifying three types of customers:
• End users (people using your application)
• Other applications (systems that depend on yours)
• Other teams (internal stakeholders)

**Step 2: Map the Journey**
For each customer type, map their journey from entry to exit:
• Entry point: How do they start interacting with your system?
• Exit point: What marks successful completion?
• Dependencies: What do you rely on? What relies on you?

**Step 3: Focus on Business Value**
Your CUJ should represent real business value delivery. For example:
"Customer places order → Payment processed → Order confirmed → Delivery scheduled"

**Current Status:** You have ${currentKnowledge.cujs} CUJs in your knowledge base. Would you like me to help you define a specific CUJ for your application?`
    }

    if (questionType === 'what') {
      return `Critical User Journeys (CUJs) are the backbone of effective observability strategy.

**What they are:**
CUJs represent end-to-end workflows that deliver business value to your customers. They're not just technical processes - they're business-critical paths through your system.

**Why they matter:**
• They help you focus monitoring on what actually impacts users
• They drive your SLI/SLO strategy (you currently have ${currentKnowledge.slis} SLIs and ${currentKnowledge.slos} SLOs)
• They align technical metrics with business outcomes

**CBA Framework Approach:**
The CBA framework emphasizes that CUJs should focus on segments where your application operates independently. This gives you the most actionable metrics and clearest ownership.

**Example CUJ Structure:**
"User initiates payment → Account validation → Payment processing → Confirmation delivered"

Each segment can be measured independently, making it easier to identify and fix issues.

Would you like help defining CUJs for your specific application?`
    }

    return this.generateCUJResponse(contextInfo)
  }

  generateAdvancedSLIResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent
    const { currentKnowledge } = contextInfo

    if (questionType === 'how' && specificity === 'beginner') {
      return `Let me guide you through creating effective Service Level Indicators (SLIs).

**Step 1: Start with Your CUJs**
Your SLIs should directly measure the health of your Critical User Journeys. You currently have ${currentKnowledge.cujs} CUJs defined.

**Step 2: Ask the Right Question**
For each CUJ segment, ask: "What would users notice if this went wrong?"
• Slow response? → Measure latency
• Failed requests? → Measure error rate
• Service unavailable? → Measure availability

**Step 3: Focus on Internal Deliverables**
Measure what YOU control, not external dependencies:
✅ Good: "Payment processing success rate"
❌ Avoid: "Third-party gateway availability"

**Step 4: Make Them Measurable**
• Use percentages for success rates (99.5% success)
• Use percentiles for latency (95th percentile < 200ms)
• Use counts for throughput (1000 requests/minute)

**Common SLI Categories:**
• **Availability**: Is the service responding?
• **Latency**: How fast is it responding?
• **Quality**: Are the responses correct?
• **Coverage**: What percentage of requests are handled?

Ready to define SLIs for a specific CUJ?`
    }

    if (questionType === 'what') {
      return `Service Level Indicators (SLIs) are the quantitative measures that tell you how well your system is performing from a user perspective.

**Key Characteristics:**
• **User-focused**: They measure what users actually experience
• **Measurable**: Based on real data, not opinions
• **Actionable**: When they're bad, you know what to fix
• **Aligned with CUJs**: Each SLI should map to a Critical User Journey

**The CBA Approach:**
Focus on metrics that reflect application health, not just infrastructure health. Ask "Is my application doing what it's supposed to do?" rather than "Are my servers running?"

**Your Current State:**
You have ${currentKnowledge.slis} SLIs defined. The CBA framework recommends starting with 3-5 key SLIs per major CUJ.

**Example SLIs:**
• **E-commerce**: Order completion rate, checkout latency, payment success rate
• **API Service**: Request success rate, response time, data accuracy
• **Web App**: Page load time, feature availability, user action success rate

**Tools Integration:**
• **Obstack**: Store and visualize your SLI metrics
• **Observe**: Detailed logs for SLI troubleshooting
• **PagerDuty**: Alert when SLIs breach thresholds

What type of application are you looking to create SLIs for?`
    }

    return this.generateSLIResponse(contextInfo)
  }

  generateAdvancedSLOResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent
    const { currentKnowledge } = contextInfo

    if (questionType === 'how' && specificity === 'beginner') {
      return `Let me help you set up Service Level Objectives (SLOs) that actually work.

**Step 1: Start with Current Performance**
Don't guess - measure your current performance first:
• Look at your existing SLIs (you have ${currentKnowledge.slis} defined)
• Gather 2-4 weeks of baseline data
• Identify your current 95th percentile performance

**Step 2: Set Achievable Targets**
• Start slightly better than current performance
• Leave room for improvement without being unrealistic
• Example: If you're at 98.5% success rate, start with 99% SLO

**Step 3: Align with Business Needs**
• Talk to stakeholders about acceptable service levels
• Not everything needs 99.99% uptime
• Consider business impact vs. engineering cost

**Step 4: Define Error Budgets**
• 99.9% availability = 43 minutes downtime/month
• 99% availability = 7.2 hours downtime/month
• Use error budget to balance reliability vs. feature velocity

**Step 5: Iterate and Improve**
• Review SLOs monthly
• Adjust based on business changes
• Tighten targets as reliability improves

**CBA Framework Tip:**
Focus on SLOs that drive behavior change. If breaching an SLO doesn't change what your team does, it's not useful.

Ready to set your first SLO?`
    }

    if (questionType === 'what') {
      return `Service Level Objectives (SLOs) are your reliability targets - they define what "good enough" looks like for your service.

**Why SLOs Matter:**
• **Decision Making**: They help you balance reliability vs. feature development
• **Error Budgets**: They give you a "budget" for failures and changes
• **Team Alignment**: Everyone knows what level of service to aim for
• **Customer Expectations**: They set realistic expectations with stakeholders

**Your Current State:**
You have ${currentKnowledge.slos} SLOs defined. The CBA framework recommends 1-2 SLOs per major SLI.

**SLO Structure:**
• **SLI**: What you're measuring (e.g., request success rate)
• **Target**: The threshold (e.g., 99.5%)
• **Time Window**: The period (e.g., 30 days)
• **Error Budget**: How much failure is acceptable (0.5% in 30 days)

**Example SLOs:**
• "Payment processing will succeed 99.5% of the time over 30 days"
• "API response time will be under 200ms for 95% of requests over 7 days"
• "User login will be available 99.9% of the time over 30 days"

**Error Budget Benefits:**
• When budget is healthy: Focus on features
• When budget is burning: Focus on reliability
• Data-driven decisions instead of gut feelings

**CBA Integration:**
• **Obstack**: Track SLO compliance and error budget burn
• **PagerDuty**: Alert when SLOs are at risk
• **Regular Reviews**: Monthly SLO review meetings

What's your biggest challenge with reliability right now?`
    }

    return this.generateSLOResponse(contextInfo)
  }

  generateAdvancedObservabilityResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent
    const { cbaFramework } = contextInfo

    if (questionType === 'how' && specificity === 'beginner') {
      return `Perfect! Let me guide you through starting with observability using the CBA framework.

**CBA Observability Maturity Levels:**
${cbaFramework.maturityLevels.map((level, i) => `${i}. ${level}`).join('\n')}

**Where to Start (Level 1):**
1. **Set up basic logging** to Observe
2. **Create your first dashboard** in Obstack
3. **Configure basic alerts** to PagerDuty
4. **Define one CUJ** to focus your efforts

**The CBA Shift: Logs → Metrics**
• **Logs**: Great for diagnosis ("What went wrong?")
• **Metrics**: Better for health monitoring ("Is everything OK?")
• **Focus**: Move from reactive to proactive monitoring

**Your First Week Plan:**
• **Day 1-2**: Define your most critical user journey
• **Day 3-4**: Identify 2-3 key metrics for that journey
• **Day 5-7**: Set up basic dashboards and alerts

**Key Questions to Answer:**
1. What's your current maturity level (0-3)?
2. What's your most business-critical user journey?
3. How do you currently find out when things break?

**CBA Tools Integration:**
• **Observe**: Centralized logging for troubleshooting
• **Obstack**: Metrics storage and SLO tracking
• **PagerDuty**: Smart alerting based on business impact

Ready to assess your current observability maturity?`
    }

    if (questionType === 'what') {
      return `Observability is your ability to understand what's happening inside your systems by examining their outputs.

**The CBA Philosophy:**
"Shift from logs to metrics for proactive monitoring. Focus on application health, not just infrastructure health."

**Three Pillars + Business Context:**
• **Metrics**: Real-time quantitative data (Obstack)
• **Logs**: Detailed diagnostic information (Observe)  
• **Traces**: Request flow through systems
• **Business Context**: How technical health impacts users

**CBA Maturity Progression:**
${cbaFramework.maturityLevels
  .map((level, i) => `**Level ${i}**: ${level}`)
  .join('\n')}

**Key Mindset Shifts:**
• From "Are my servers running?" to "Is my application working?"
• From reactive firefighting to proactive monitoring
• From infrastructure metrics to user experience metrics

**The CBA Approach:**
1. **Start with CUJs**: What matters to users?
2. **Define SLIs**: How do you measure CUJ health?
3. **Set SLOs**: What's acceptable performance?
4. **Build dashboards**: Visualize what matters
5. **Create alerts**: Know when to act

**Business Value:**
• **Predict issues** before customers notice
• **Reduce MTTR** with better diagnostics
• **Make data-driven decisions** about reliability vs. features
• **Improve customer experience** through better reliability

What's your biggest observability challenge right now?`
    }

    return this.generateObservabilityResponse(contextInfo)
  }

  generateAdvancedSecurityResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent

    if (questionType === 'how' && specificity === 'beginner') {
      return `Great question! Let me help you get started with DevSecOps using a practical approach.

**DevSecOps Foundation (Week 1-2):**
1. **Security Scanning in CI/CD**
   • Add SAST (Static Application Security Testing) to your pipeline
   • Implement dependency vulnerability scanning
   • Set up container image scanning

2. **Secure Development Practices**
   • Code review checklist with security items
   • Secure coding guidelines for your team
   • Input validation and output encoding standards

**Security SLIs to Track:**
• **Vulnerability Remediation Time**: How quickly you fix security issues
• **Security Scan Coverage**: Percentage of code/dependencies scanned
• **Failed Authentication Rate**: Unusual login patterns
• **Security Incident Response Time**: Time to detect and respond

**Cultural Integration:**
• **Security Champions**: Designate security advocates in each team
• **Training**: Regular security awareness sessions
• **Threat Modeling**: Include security in design discussions

**Tools Integration:**
• **CI/CD Pipeline**: Automated security testing
• **Monitoring**: Security-focused SLIs and alerts
• **Incident Response**: Security incident runbooks

**Quick Wins (This Week):**
1. Add a dependency scanner to your build
2. Create a security checklist for code reviews
3. Set up alerts for failed authentication spikes

**Remember**: Security isn't just about tools - it's about making security everyone's responsibility and part of your daily workflow.

What's your current development workflow like?`
    }

    return this.generateSecurityResponse(contextInfo)
  }

  generateImplementationResponse(message, intent, contextInfo) {
    return `I'd be happy to help you implement this! Let me provide a practical approach.

**Implementation Strategy:**
1. **Start Small**: Pick one critical user journey to focus on
2. **Measure First**: Establish baseline metrics before setting targets
3. **Iterate Quickly**: Implement, measure, adjust, repeat
4. **Build Consensus**: Get team buy-in on what you're measuring and why

**Typical Implementation Timeline:**
• **Week 1**: Define CUJ and identify key metrics
• **Week 2**: Set up basic monitoring and dashboards
• **Week 3**: Define initial SLIs and SLOs
• **Week 4**: Implement alerting and review processes

**Common Implementation Challenges:**
• **Too many metrics**: Start with 3-5 key indicators
• **Perfect targets**: Start achievable, improve iteratively
• **Tool complexity**: Use what you have, add tools gradually
• **Team resistance**: Show value early with quick wins

**CBA Framework Support:**
The CBA observability team provides hands-on support for:
• CUJ definition workshops
• SLI/SLO implementation guidance
• Tool integration assistance
• Best practices consultation

What specific aspect would you like help implementing first?`
  }

  generateComparisonResponse(message, intent, contextInfo) {
    const messageLower = message.toLowerCase()

    if (messageLower.includes('sli') && messageLower.includes('slo')) {
      return `Great question! Here's the key difference between SLIs and SLOs:

**SLIs (Service Level Indicators):**
• **What**: The actual measurements
• **Example**: "Request success rate is currently 99.2%"
• **Purpose**: Tell you what's happening right now
• **Nature**: Objective, measurable data

**SLOs (Service Level Objectives):**
• **What**: The targets you're aiming for
• **Example**: "Request success rate should be ≥99.5%"
• **Purpose**: Define what "good" looks like
• **Nature**: Goals and expectations

**Simple Analogy:**
• **SLI**: Your car's speedometer reading (65 mph)
• **SLO**: The speed limit you're trying to follow (70 mph)

**In Practice:**
1. **SLI**: Measure payment success rate = 98.8%
2. **SLO**: Target payment success rate ≥99.0%
3. **Status**: Currently below target, need to investigate

**Your Current State:**
• SLIs defined: ${contextInfo.currentKnowledge.slis}
• SLOs defined: ${contextInfo.currentKnowledge.slos}

The CBA framework recommends 1-2 SLOs per key SLI to avoid alert fatigue.`
    }

    if (
      messageLower.includes('observability') &&
      messageLower.includes('monitoring')
    ) {
      return `Excellent question! Here's how observability and monitoring differ:

**Traditional Monitoring:**
• **Reactive**: "Something broke, now what?"
• **Known unknowns**: Monitor what you expect to break
• **Infrastructure-focused**: CPU, memory, disk space
• **Alert-heavy**: Lots of alerts, many false positives

**Observability:**
• **Proactive**: "How healthy is my system?"
• **Unknown unknowns**: Discover issues you didn't expect
• **User-focused**: How is the user experience?
• **Context-rich**: Understand why things happen

**CBA Framework Perspective:**
• **Monitoring**: "Are my servers running?"
• **Observability**: "Is my application doing what it's supposed to do?"

**Practical Difference:**
• **Monitoring**: Alert when CPU > 80%
• **Observability**: Alert when user checkout success rate < 99%

**The Evolution:**
1. **Level 0**: No visibility
2. **Level 1**: Basic monitoring (infrastructure)
3. **Level 2**: Structured monitoring (application + infrastructure)
4. **Level 3**: Full observability (predictive, user-focused)

Which approach does your current setup lean toward?`
    }

    return `I'd be happy to help compare those concepts! Could you be more specific about what you'd like me to compare? For example:
• SLIs vs SLOs
• Monitoring vs Observability  
• Different observability tools
• Security approaches
• Implementation strategies`
  }

  generateTroubleshootingResponse(message, intent, contextInfo) {
    return `I'm here to help troubleshoot! Let me guide you through a systematic approach.

**Troubleshooting Framework:**
1. **Define the Problem**: What exactly is broken?
2. **Check Your SLIs**: Are your key metrics showing issues?
3. **Review Recent Changes**: What changed recently?
4. **Follow the CUJ**: Where in the user journey is it failing?

**Common Issues & Solutions:**

**"My alerts are too noisy"**
• Review SLO thresholds - are they too sensitive?
• Focus on user-impacting metrics, not infrastructure
• Use error budgets to reduce alert fatigue

**"I don't know what to monitor"**
• Start with your most critical user journey
• Ask: "What would users notice if this broke?"
• Begin with 3-5 key metrics, expand gradually

**"My dashboards are overwhelming"**
• Create role-based dashboards (dev, ops, business)
• Focus on trends, not just current values
• Use the CBA framework: metrics over logs

**"SLOs keep getting breached"**
• Check if targets are realistic based on current performance
• Review error budget burn rate
• Consider if you need to improve reliability vs. adjust targets

**CBA Troubleshooting Tools:**
• **Observe**: Detailed logs for root cause analysis
• **Obstack**: Metrics correlation and trending
• **PagerDuty**: Alert correlation and escalation

What specific issue are you facing right now?`
  }

  generateAdvancedGeneralResponse(message, intent, contextInfo) {
    const { questionType, specificity } = intent
    const { currentKnowledge, contextFiles } = contextInfo

    if (specificity === 'beginner') {
      return `Welcome to DevSecOps observability! I'm here to help you get started.

**Your Current Setup:**
• Knowledge base entries: ${
        currentKnowledge.cujs +
        currentKnowledge.slis +
        currentKnowledge.slos +
        currentKnowledge.bestPractices
      }
• Context files loaded: ${contextFiles}
• CBA framework: Integrated and ready

**Great Starting Points:**
1. **"How do I start with observability?"** - I'll walk you through the CBA maturity levels
2. **"What's a CUJ?"** - Learn about Critical User Journeys
3. **"Help me define SLIs"** - Create meaningful metrics
4. **"How do I set SLOs?"** - Set realistic reliability targets

**Popular Questions:**
• "What's the difference between SLIs and SLOs?"
• "How do I implement monitoring for my application?"
• "What are DevSecOps best practices?"
• "How do I troubleshoot observability issues?"

**CBA Framework Benefits:**
• Metrics-driven approach over log-heavy monitoring
• Focus on user experience, not just infrastructure
• 4-level maturity progression (0-3)
• Practical tools: Observe, Obstack, PagerDuty

What would you like to explore first?`
    }

    return `I'm your DevSecOps SME assistant, specialized in observability, CUJs, SLIs, and SLOs using the CBA framework.

**I can help you with:**
• **Critical User Journeys**: Define and optimize user workflows
• **SLI/SLO Strategy**: Create meaningful metrics and targets  
• **Observability Implementation**: Practical monitoring approaches
• **DevSecOps Practices**: Security integration in development
• **CBA Framework**: 4-level maturity progression

**Your Context:**
• ${currentKnowledge.cujs} CUJs, ${currentKnowledge.slis} SLIs, ${currentKnowledge.slos} SLOs defined
• ${contextFiles} context files loaded with your specific knowledge
• CBA observability framework fully integrated

**Ask me anything like:**
• "How do I improve my observability maturity?"
• "What SLIs should I track for an e-commerce site?"
• "Help me troubleshoot my alerting strategy"
• "What's the best way to implement DevSecOps?"

What specific challenge can I help you solve today?`
  }
}

// Enhanced DevSecOps Knowledge Base with AI integration
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
    this.aiService = new AIService()
    this.contextFiles = new Map()
    this.loadContextFiles()
  }

  async loadContextFiles() {
    try {
      // Load context files from the context directory
      const contextDir = path.join(__dirname, 'context')
      await this.loadDirectoryRecursively(contextDir)
      console.log(`Loaded ${this.contextFiles.size} context files`)
    } catch (error) {
      console.log(
        'Context directory not found, continuing without context files'
      )
    }
  }

  async loadDirectoryRecursively(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await this.loadDirectoryRecursively(fullPath)
        } else if (entry.isFile() && this.isTextFile(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8')
            const relativePath = path.relative(__dirname, fullPath)
            this.contextFiles.set(relativePath, {
              content,
              lastModified: new Date(),
              type: this.getFileType(entry.name),
            })
          } catch (error) {
            console.log(`Could not read file ${fullPath}:`, error.message)
          }
        }
      }
    } catch (error) {
      console.log(`Could not read directory ${dir}:`, error.message)
    }
  }

  isTextFile(filename) {
    const textExtensions = [
      '.md',
      '.txt',
      '.json',
      '.yaml',
      '.yml',
      '.js',
      '.py',
      '.sh',
      '.sql',
    ]
    return textExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  getFileType(filename) {
    if (filename.endsWith('.md')) return 'markdown'
    if (filename.endsWith('.json')) return 'json'
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml'
    return 'text'
  }

  async generateAIResponse(message, type = 'general') {
    const context = {
      knowledgeBase: this.knowledgeBase,
      contextFiles: Array.from(this.contextFiles.entries()),
      cbaFramework: {
        maturityLevels: 4,
        tools: ['Observe', 'Obstack', 'PagerDuty'],
        approach: 'metrics-driven',
      },
    }

    return await this.aiService.generateResponse(message, context)
  }

  // ... (keep all existing methods from the original server)
  async processPDF(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath)
      const pdfData = await pdfParse(fileBuffer)

      const filename = path.basename(filePath)
      const content = pdfData.text

      this.pdfContents.set(filename, {
        filename,
        content,
        extractedAt: new Date().toISOString(),
      })

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

    if (category === 'all' || category === 'context') {
      results.contextMatches = Array.from(this.contextFiles.entries())
        .filter(
          ([filename, data]) =>
            filename.toLowerCase().includes(queryLower) ||
            data.content.toLowerCase().includes(queryLower)
        )
        .map(([filename, data]) => ({
          filename,
          type: data.type,
          relevantSnippets: this.extractRelevantSnippets(data.content, query),
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

// Socket.IO for real-time AI chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('chat_message', async (data) => {
    const { message, type } = data

    try {
      let response

      if (type === 'ai_chat' || type === 'general') {
        // Use AI service for conversational responses
        response = await knowledgeBase.generateAIResponse(message, type)
      } else {
        // Use existing structured responses for specific queries
        switch (type) {
          case 'search':
            response = knowledgeBase.searchKnowledgeBase(message)
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
            // Default to AI chat for unknown types
            response = await knowledgeBase.generateAIResponse(
              message,
              'general'
            )
        }
      }

      socket.emit('chat_response', {
        message: response,
        timestamp: new Date().toISOString(),
        type: typeof response === 'string' ? 'ai_text' : 'structured',
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
    console.log(
      `DevSecOps SME Platform (AI-Enhanced) running on http://localhost:${PORT}`
    )
    console.log('Features available:')
    console.log('- AI-Powered Chat Interface')
    console.log('- PDF Upload and Processing')
    console.log('- Context-Aware Responses')
    console.log('- DevSecOps Knowledge Base')
    console.log('- CUJ/SLI/SLO Analysis')
    console.log('')
    console.log('AI Configuration:')
    console.log(
      '- OpenAI:',
      process.env.OPENAI_API_KEY ? '✓ Available' : '✗ Not configured'
    )
    console.log(
      '- Anthropic:',
      process.env.ANTHROPIC_API_KEY ? '✓ Available' : '✗ Not configured'
    )
    console.log('- Local Fallback: ✓ Always available')
  })
}

startServer().catch(console.error)
