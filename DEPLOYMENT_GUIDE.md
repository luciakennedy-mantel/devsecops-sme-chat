# 🚀 Deployment Guide - DevSecOps SME Platform

## 📋 GitHub Repository Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in repository details:**
   - **Repository name**: `devsecops-sme-platform`
   - **Description**: `DevSecOps SME Platform with AI-powered documentation assistant featuring Claude 3.5 Sonnet integration`
   - **Visibility**: Choose Public or Private based on your needs
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. **Click "Create repository"**

### Step 2: Push Your Local Repository

After creating the GitHub repository, you'll see a page with setup instructions. Use these commands:

```bash
# Navigate to your project directory
cd /Users/luciakennedy/Documents/devsecops-sme-platform

# Add the GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/devsecops-sme-platform.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify Upload

1. **Refresh your GitHub repository page**
2. **Verify all files are uploaded** including:
   - ✅ README.md with full documentation
   - ✅ All context files (knowledge base, templates)
   - ✅ Server files and configuration
   - ✅ .gitignore (protecting sensitive files)
   - ✅ Package.json and dependencies

## 🔧 Production Deployment Options

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create your-devsecops-platform
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3000
   # Add your AI gateway credentials
   heroku config:set OPENAI_API_KEY=your_key_here
   heroku config:set OPENAI_BASE_URL=https://ai.mantelgroup.com.au/v1
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   # Follow the prompts
   ```

3. **Set environment variables** in Vercel dashboard

### Option 3: AWS/Azure/GCP

1. **Create VM instance**
2. **Install Node.js and dependencies**
3. **Clone repository**
4. **Set up environment variables**
5. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name devsecops-platform
   pm2 startup
   pm2 save
   ```

## 🔒 Security Checklist for Production

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use secure environment variable management
- ✅ Rotate API keys regularly
- ✅ Use HTTPS in production

### Server Security
- ✅ Set up SSL certificates
- ✅ Configure firewall rules
- ✅ Enable security headers
- ✅ Regular security updates
- ✅ Monitor for vulnerabilities

### Access Control
- ✅ Implement authentication if needed
- ✅ Set up proper CORS policies
- ✅ Monitor access logs
- ✅ Rate limiting for API endpoints

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check if services are running
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Log Monitoring
```bash
# View application logs
pm2 logs devsecops-platform

# Monitor system resources
pm2 monit
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Restart services
pm2 restart devsecops-platform
```

## 🤖 AI Chat Server Deployment

### Separate MCP Server Deployment

The AI chat functionality requires the MCP server to be deployed separately:

1. **Navigate to MCP server directory**
   ```bash
   cd ../Cline/MCP/devsecops-docs-server
   ```

2. **Build the MCP server**
   ```bash
   npm run build
   ```

3. **Deploy MCP server** (same options as main platform)

4. **Update environment variables** to point to deployed MCP server

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  devsecops-platform:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./uploads:/app/uploads

  mcp-server:
    build: ../Cline/MCP/devsecops-docs-server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - CHAT_PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL}
```

Deploy with:
```bash
docker-compose up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy DevSecOps Platform

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## 📈 Scaling Considerations

### Load Balancing
- Use nginx or similar for load balancing
- Implement session management for multiple instances
- Consider Redis for session storage

### Database
- Add database for persistent storage if needed
- Consider MongoDB or PostgreSQL for user data
- Implement proper backup strategies

### Caching
- Implement Redis for caching frequent queries
- Use CDN for static assets
- Cache AI responses where appropriate

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   ```

2. **Environment variables not loading**
   ```bash
   # Verify .env file exists and has correct format
   cat .env
   ```

3. **AI chat not working**
   - Check MCP server is running
   - Verify API credentials
   - Check network connectivity to AI gateway

### Debug Commands
```bash
# Check application status
pm2 status

# View detailed logs
pm2 logs --lines 100

# Monitor resource usage
htop
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check firewall and network settings
5. Create an issue in the GitHub repository

---

**Happy Deploying! 🚀**
