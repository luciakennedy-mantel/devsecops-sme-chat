#!/usr/bin/env node

const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('🤖 OpenAI Setup for DevSecOps SME Platform')
console.log('==========================================')
console.log('')
console.log('To get better conversational AI, you need an OpenAI API key.')
console.log('')
console.log('Steps to get your API key:')
console.log('1. Go to: https://platform.openai.com/api-keys')
console.log('2. Sign up or log in to your OpenAI account')
console.log('3. Click "Create new secret key"')
console.log('4. Copy the key (starts with sk-...)')
console.log('')
console.log(
  'Note: OpenAI requires a payment method, but usage is very affordable'
)
console.log('(typically $0.01-0.05 per conversation)')
console.log('')

rl.question('Do you have an OpenAI API key? (y/n): ', (hasKey) => {
  if (hasKey.toLowerCase() === 'y' || hasKey.toLowerCase() === 'yes') {
    rl.question('Enter your OpenAI API key: ', (apiKey) => {
      if (apiKey.startsWith('sk-')) {
        // Create or update .env file
        let envContent = ''

        try {
          envContent = fs.readFileSync('.env', 'utf8')
        } catch (error) {
          // File doesn't exist, create new
          envContent = ''
        }

        // Remove existing OPENAI_API_KEY line if present
        const lines = envContent
          .split('\n')
          .filter((line) => !line.startsWith('OPENAI_API_KEY='))

        // Add new API key
        lines.push(`OPENAI_API_KEY=${apiKey}`)
        lines.push('PORT=3000')

        fs.writeFileSync('.env', lines.join('\n'))

        console.log('')
        console.log('✅ OpenAI API key saved to .env file!')
        console.log('')
        console.log('🚀 Restart your server to use OpenAI:')
        console.log('   1. Stop the current server (Ctrl+C)')
        console.log('   2. Run: node ai-chat-server.js')
        console.log('')
        console.log(
          'You should see "OpenAI: ✓ Available" in the startup message.'
        )
        console.log('')
        console.log('Now you can have natural conversations like:')
        console.log('• "Explain observability maturity levels"')
        console.log('• "How do I implement SLOs for my payment system?"')
        console.log(
          '• "What are the key DevSecOps practices I should focus on?"'
        )
      } else {
        console.log('')
        console.log('❌ Invalid API key format. OpenAI keys start with "sk-"')
        console.log(
          'Please get a valid key from https://platform.openai.com/api-keys'
        )
      }

      rl.close()
    })
  } else {
    console.log('')
    console.log('📝 To get an OpenAI API key:')
    console.log('')
    console.log('1. Visit: https://platform.openai.com/api-keys')
    console.log('2. Create an account (free)')
    console.log('3. Add a payment method (required for API access)')
    console.log('4. Create a new secret key')
    console.log('5. Run this setup script again')
    console.log('')
    console.log('💡 Alternative: The platform works with local responses too,')
    console.log('   but OpenAI provides much better conversational experience.')
    console.log('')
    console.log('Cost estimate: ~$10-50/month for moderate usage')

    rl.close()
  }
})
