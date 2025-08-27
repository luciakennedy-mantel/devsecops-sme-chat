#!/bin/bash

# DevSecOps Chat Assistant Startup Script

echo "🤖 Starting DevSecOps Chat Assistant..."

# Check if .env exists
if [ ! -f "mcp-server/.env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp mcp-server/.env.example mcp-server/.env
    echo "📝 Please edit mcp-server/.env and add your OpenAI API key"
    echo "   Then run this script again."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "mcp-server/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd mcp-server
    npm install
    cd ..
fi

# Start the chat server
echo "🚀 Starting chat server at http://localhost:3001"
cd mcp-server
node web-ui-openai.cjs
