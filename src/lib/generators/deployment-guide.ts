/**
 * Deployment Playbooks Generator
 * Generates comprehensive deployment guides for all platforms
 */

import { Runtime, RuntimeRecommendation } from '@/lib/utils/runtime-selector';
import { ToolSpec } from '@/lib/types/tool-spec';

export interface DeploymentGuide {
  markdown: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: string;
  prerequisites: string[];
}

export interface AgentConfig {
  name: string;
  description?: string;
  runtime: Runtime;
}

/**
 * Generate deployment guide for a specific runtime
 */
export function generateDeploymentGuide(
  runtime: Runtime,
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>,
  recommendation?: RuntimeRecommendation
): DeploymentGuide {
  
  const guides: Record<Runtime, () => DeploymentGuide> = {
    'vercel': () => generateVercelGuide(agentConfig, envVars),
    'vercel-cron': () => generateVercelCronGuide(agentConfig, envVars),
    'railway': () => generateRailwayGuide(agentConfig, envVars),
    'render': () => generateRenderGuide(agentConfig, envVars),
    'fly.io': () => generateFlyIoGuide(agentConfig, envVars),
    'netlify': () => generateNetlifyGuide(agentConfig, envVars),
    'cloudflare-pages': () => generateCloudflareGuide(agentConfig, envVars),
    'github-actions': () => generateGitHubActionsGuide(agentConfig, envVars),
    'docker': () => generateDockerGuide(agentConfig, envVars)
  };
  
  const generator = guides[runtime];
  if (generator) {
    return generator();
  }
  
  // Fallback
  return {
    markdown: `# Deploy to ${runtime}\n\nSee deployment documentation for ${runtime}.`,
    estimatedTime: '15 minutes',
    difficulty: 'medium',
    cost: 'Check provider pricing',
    prerequisites: ['GitHub account', 'All API keys ready']
  };
}

/**
 * Generate Vercel deployment guide
 */
function generateVercelGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  const projectName = agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    markdown: `# Deploy to Vercel

## Prerequisites
- [ ] GitHub account
- [ ] All API keys ready (see SETUP.md)

## Steps (5 minutes)

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name} setup"

# Create repo (using GitHub CLI)
gh repo create ${projectName} --public --source=. --push

# Or manually:
# 1. Create repo on GitHub
# 2. git remote add origin https://github.com/yourusername/${projectName}.git
# 3. git push -u origin main
\`\`\`

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your \`${projectName}\` repo
4. Click "Import"

### 3. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`${v.example || 'your-key-here'}\`
- Get from: ${v.getFrom}
- Purpose: ${v.purpose}
`).join('\n')}

**Or use Vercel CLI:**
\`\`\`bash
${envVars.map(v => `vercel env add ${v.key}`).join('\n')}
\`\`\`

### 4. Deploy

1. Click "Deploy"
2. Wait ~2 minutes
3. Your agent is live at: \`${projectName}.vercel.app\`

## Verify Deployment

\`\`\`bash
curl https://${projectName}.vercel.app/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Free (Hobby plan)**
- 100GB bandwidth/month
- Unlimited serverless function invocations
- Edge network included
- Custom domains

## Limitations

- 10 second timeout per function execution
- No persistent state between invocations
- Cold starts possible (first request may be slower)

## Troubleshooting

**Build fails?**
- Check Vercel build logs for missing dependencies
- Verify all environment variables are set
- Ensure \`package.json\` has correct build script

**Runtime errors?**
- Check Vercel function logs (Dashboard → Functions)
- Verify API keys are correct
- Test locally first: \`npm run dev\`

**Need help?**  
- Discord: https://discord.gg/agentex
- Vercel Docs: https://vercel.com/docs
`,
    estimatedTime: '5 minutes',
    difficulty: 'easy',
    cost: 'Free (Hobby plan)',
    prerequisites: ['GitHub account', 'All API keys ready']
  };
}

/**
 * Generate Vercel Cron deployment guide
 */
function generateVercelCronGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  const projectName = agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    markdown: `# Deploy to Vercel with Cron

## Prerequisites
- [ ] GitHub account
- [ ] All API keys ready (see SETUP.md)

## Steps (7 minutes)

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name} setup"
gh repo create ${projectName} --public --source=. --push
\`\`\`

### 2. Configure Cron Job

Create \`vercel.json\` in your project root:

\`\`\`json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 * * * *"
  }]
}
\`\`\`

**Schedule format:** \`minute hour day month weekday\`
- \`0 * * * *\` = Every hour
- \`0 0 * * *\` = Every day at midnight
- \`*/15 * * * *\` = Every 15 minutes

### 3. Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your \`${projectName}\` repo
4. Click "Import"

### 4. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`${v.example || 'your-key-here'}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 5. Deploy

1. Click "Deploy"
2. Wait ~2 minutes
3. Cron job will run automatically

## Verify Deployment

\`\`\`bash
# Test cron endpoint manually
curl https://${projectName}.vercel.app/api/cron

# Check cron execution logs in Vercel dashboard
\`\`\`

## Cost

**Free (Hobby plan)**
- Cron jobs included
- Max 1 execution per minute on free tier
- 10 second timeout per execution

## Limitations

- Max 1/minute frequency on free tier
- 10 second timeout per execution
- No persistent state between runs

## Troubleshooting

**Cron not running?**
- Verify \`vercel.json\` is in project root
- Check cron schedule format
- Review Vercel cron logs in dashboard

**Need help?**  
- Discord: https://discord.gg/agentex
- Vercel Cron Docs: https://vercel.com/docs/cron-jobs
`,
    estimatedTime: '7 minutes',
    difficulty: 'easy',
    cost: 'Free (Hobby plan)',
    prerequisites: ['GitHub account', 'All API keys ready']
  };
}

/**
 * Generate Railway deployment guide
 */
function generateRailwayGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  return {
    markdown: `# Deploy to Railway

## Prerequisites
- [ ] Railway account (https://railway.app)
- [ ] Credit card (for paid plans)
- [ ] All API keys ready (see SETUP.md)

## Steps (10 minutes)

### 1. Install Railway CLI

\`\`\`bash
npm install -g @railway/cli
railway login
\`\`\`

### 2. Initialize Project

\`\`\`bash
railway init
# Select: "Empty Project"
# Name: ${agentConfig.name}
\`\`\`

### 3. Set Environment Variables

\`\`\`bash
${envVars.map(v => `railway variables set ${v.key}=your-key-here`).join('\n')}
\`\`\`

**Or use Railway dashboard:**
1. Go to your project → Variables
2. Add each environment variable
3. Click "Deploy"

### 4. Deploy

\`\`\`bash
railway up
\`\`\`

### 5. Get URL

\`\`\`bash
railway domain
# Your agent URL will be displayed
\`\`\`

**Or set custom domain:**
\`\`\`bash
railway domain add yourdomain.com
\`\`\`

## Verify Deployment

\`\`\`bash
curl https://your-app.railway.app/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Starter Plan: $5/month**
- 500 hours included
- Always-on hosting
- Integrated databases available
- Flexible resource allocation

**Your agent usage:** ~720 hours/month (always-on)
**Total: ~$5-10/month**

## Features

- ✅ Always-on hosting (no cold starts)
- ✅ Integrated PostgreSQL/MySQL databases
- ✅ Persistent volumes for file storage
- ✅ WebSocket support
- ✅ Custom domains
- ✅ Automatic HTTPS

## Limitations

- Requires credit card for paid plans
- Manual setup needed (not as simple as Vercel)
- No free tier for always-on services

## Troubleshooting

**Deployment fails?**
- Check Railway build logs
- Verify all environment variables are set
- Ensure \`package.json\` has correct start script

**App not responding?**
- Check Railway logs: \`railway logs\`
- Verify environment variables are correct
- Test locally first: \`npm run dev\`

**Need help?**  
- Discord: https://discord.gg/agentex
- Railway Docs: https://docs.railway.app
`,
    estimatedTime: '10 minutes',
    difficulty: 'medium',
    cost: '$5-20/month',
    prerequisites: ['Railway account', 'Credit card', 'All API keys ready']
  };
}

/**
 * Generate Render deployment guide
 */
function generateRenderGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  const projectName = agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    markdown: `# Deploy to Render

## Prerequisites
- [ ] Render account (https://render.com)
- [ ] Credit card (for paid plans)
- [ ] All API keys ready (see SETUP.md)

## Steps (8 minutes)

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name} setup"
gh repo create ${projectName} --public --source=. --push
\`\`\`

### 2. Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your \`${projectName}\` repository

### 3. Configure Service

**Settings:**
- **Name:** ${agentConfig.name}
- **Environment:** Node
- **Build Command:** \`npm install && npm run build\`
- **Start Command:** \`npm start\`
- **Plan:** Free (spins down after inactivity) or Starter ($7/month)

### 4. Set Environment Variables

In Render dashboard → Environment, add:

${envVars.map(v => `**${v.key}**
- Value: \`${v.example || 'your-key-here'}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 5. Deploy

1. Click "Create Web Service"
2. Wait ~5 minutes for first deployment
3. Your agent is live at: \`${projectName}.onrender.com\`

## Verify Deployment

\`\`\`bash
curl https://${projectName}.onrender.com/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**Starter Plan: $7/month**
- Always-on hosting
- No spin-down delays
- Integrated databases available

## Features

- ✅ Always-on hosting (paid plans)
- ✅ Integrated PostgreSQL/Redis databases
- ✅ Persistent disks for file storage
- ✅ WebSocket support
- ✅ Custom domains
- ✅ Automatic HTTPS

## Limitations

- Free tier spins down after inactivity
- Requires credit card for always-on hosting
- Manual setup needed

## Troubleshooting

**Build fails?**
- Check Render build logs
- Verify build command is correct
- Ensure all dependencies are in \`package.json\`

**Service not responding?**
- Check Render logs
- Verify environment variables
- Free tier may be spinning up (wait 30 seconds)

**Need help?**  
- Discord: https://discord.gg/agentex
- Render Docs: https://render.com/docs
`,
    estimatedTime: '8 minutes',
    difficulty: 'medium',
    cost: 'Free tier available, $7/month for always-on',
    prerequisites: ['Render account', 'All API keys ready']
  };
}

/**
 * Generate Fly.io deployment guide
 */
function generateFlyIoGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  return {
    markdown: `# Deploy to Fly.io

## Prerequisites
- [ ] Fly.io account (https://fly.io)
- [ ] Fly CLI installed
- [ ] All API keys ready (see SETUP.md)

## Steps (12 minutes)

### 1. Install Fly CLI

\`\`\`bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
\`\`\`

### 2. Login

\`\`\`bash
fly auth login
\`\`\`

### 3. Initialize App

\`\`\`bash
fly launch
# Follow prompts:
# - App name: ${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}
# - Region: Choose closest to you
# - PostgreSQL: No (unless needed)
# - Redis: No (unless needed)
\`\`\`

### 4. Set Environment Variables

\`\`\`bash
${envVars.map(v => `fly secrets set ${v.key}=your-key-here`).join('\n')}
\`\`\`

### 5. Deploy

\`\`\`bash
fly deploy
\`\`\`

### 6. Get URL

\`\`\`bash
fly status
# Your agent URL will be displayed
\`\`\`

## Verify Deployment

\`\`\`bash
curl https://${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.fly.dev/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Free Tier:**
- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer

**Paid Plans:**
- Starting at $1.94/month per VM
- Pay-as-you-go pricing
- Global edge deployment

## Features

- ✅ Global edge network
- ✅ Always-on hosting
- ✅ Persistent volumes
- ✅ WebSocket support
- ✅ Custom domains
- ✅ Automatic HTTPS

## Limitations

- More complex setup than Vercel
- Requires CLI knowledge
- Free tier limited to 3 VMs

## Troubleshooting

**Deployment fails?**
- Check \`fly.toml\` configuration
- Verify build process works locally
- Check Fly.io logs: \`fly logs\`

**App not responding?**
- Check Fly.io status: \`fly status\`
- View logs: \`fly logs\`
- Verify secrets are set: \`fly secrets list\`

**Need help?**  
- Discord: https://discord.gg/agentex
- Fly.io Docs: https://fly.io/docs
`,
    estimatedTime: '12 minutes',
    difficulty: 'medium',
    cost: 'Free tier available, paid from $5/month',
    prerequisites: ['Fly.io account', 'Fly CLI installed', 'All API keys ready']
  };
}

/**
 * Generate Netlify deployment guide
 */
function generateNetlifyGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  const projectName = agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    markdown: `# Deploy to Netlify

## Prerequisites
- [ ] Netlify account (https://netlify.com)
- [ ] All API keys ready (see SETUP.md)

## Steps (6 minutes)

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name} setup"
gh repo create ${projectName} --public --source=. --push
\`\`\`

### 2. Import to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your \`${projectName}\` repository

### 3. Configure Build Settings

**Build settings:**
- **Build command:** \`npm run build\`
- **Publish directory:** \`.next\` (for Next.js) or \`dist\`
- **Functions directory:** \`netlify/functions\` (if using serverless functions)

### 4. Set Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`${v.example || 'your-key-here'}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 5. Deploy

1. Click "Deploy site"
2. Wait ~2 minutes
3. Your agent is live at: \`${projectName}.netlify.app\`

## Verify Deployment

\`\`\`bash
curl https://${projectName}.netlify.app/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Free (Starter plan)**
- 100GB bandwidth/month
- Unlimited serverless function invocations
- 10 second timeout

## Limitations

- 10 second timeout per function
- No persistent state
- Cold starts possible

## Troubleshooting

**Build fails?**
- Check Netlify build logs
- Verify build command is correct
- Ensure all dependencies are installed

**Need help?**  
- Discord: https://discord.gg/agentex
- Netlify Docs: https://docs.netlify.com
`,
    estimatedTime: '6 minutes',
    difficulty: 'easy',
    cost: 'Free (Starter plan)',
    prerequisites: ['Netlify account', 'All API keys ready']
  };
}

/**
 * Generate Cloudflare Pages deployment guide
 */
function generateCloudflareGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  const projectName = agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  return {
    markdown: `# Deploy to Cloudflare Pages

## Prerequisites
- [ ] Cloudflare account (https://dash.cloudflare.com)
- [ ] All API keys ready (see SETUP.md)

## Steps (7 minutes)

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name} setup"
gh repo create ${projectName} --public --source=. --push
\`\`\`

### 2. Create Pages Project

1. Go to https://dash.cloudflare.com
2. Navigate to "Workers & Pages"
3. Click "Create application" → "Pages" → "Connect to Git"
4. Select your GitHub account and \`${projectName}\` repository

### 3. Configure Build Settings

**Build settings:**
- **Framework preset:** Next.js (or your framework)
- **Build command:** \`npm run build\`
- **Build output directory:** \`.next\` (for Next.js)

### 4. Set Environment Variables

In Cloudflare dashboard → Pages → Settings → Environment variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`${v.example || 'your-key-here'}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 5. Deploy

1. Click "Save and Deploy"
2. Wait ~3 minutes
3. Your agent is live at: \`${projectName}.pages.dev\`

## Verify Deployment

\`\`\`bash
curl https://${projectName}.pages.dev/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Free**
- Unlimited requests
- Unlimited bandwidth
- Global edge network
- 10 second timeout

## Features

- ✅ Global edge network (fast worldwide)
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ DDoS protection

## Limitations

- 10 second timeout per function
- No persistent state
- Limited to serverless functions

## Troubleshooting

**Build fails?**
- Check Cloudflare build logs
- Verify build command is correct
- Ensure framework preset matches your project

**Need help?**  
- Discord: https://discord.gg/agentex
- Cloudflare Docs: https://developers.cloudflare.com/pages
`,
    estimatedTime: '7 minutes',
    difficulty: 'easy',
    cost: 'Free',
    prerequisites: ['Cloudflare account', 'All API keys ready']
  };
}

/**
 * Generate GitHub Actions deployment guide
 */
function generateGitHubActionsGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  return {
    markdown: `# Deploy with GitHub Actions

## Prerequisites
- [ ] GitHub account
- [ ] All API keys ready (see SETUP.md)

## Steps (5 minutes)

### 1. Create Workflow File

Create \`.github/workflows/agent.yml\`:

\`\`\`yaml
name: Run Agent

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run agent
        env:
${envVars.map(v => `          ${v.key}: \${{ secrets.${v.key} }}`).join('\n')}
        run: npm start
\`\`\`

### 2. Set Secrets

In GitHub repository → Settings → Secrets and variables → Actions, add:

${envVars.map(v => `**${v.key}**
- Value: Your API key
- Get from: ${v.getFrom}
`).join('\n')}

### 3. Run Workflow

1. Go to Actions tab in your repository
2. Click "Run workflow"
3. Select branch and click "Run workflow"
4. Monitor execution in Actions tab

## Cost

**Free (for public repos)**
- 2,000 minutes/month free
- Perfect for scheduled tasks
- No hosting costs

## Features

- ✅ Free for public repositories
- ✅ Scheduled execution (cron)
- ✅ Manual triggers
- ✅ No hosting required

## Limitations

- Only runs when triggered (not always-on)
- 2,000 minutes/month limit on free tier
- Requires GitHub repository

## Troubleshooting

**Workflow not running?**
- Check cron schedule format
- Verify secrets are set correctly
- Check Actions tab for errors

**Need help?**  
- Discord: https://discord.gg/agentex
- GitHub Actions Docs: https://docs.github.com/en/actions
`,
    estimatedTime: '5 minutes',
    difficulty: 'easy',
    cost: 'Free (for public repos)',
    prerequisites: ['GitHub account', 'All API keys ready']
  };
}

/**
 * Generate Docker deployment guide
 */
function generateDockerGuide(
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string; example?: string }>
): DeploymentGuide {
  return {
    markdown: `# Deploy with Docker

## Prerequisites
- [ ] Docker installed
- [ ] Docker Hub account (or container registry)
- [ ] All API keys ready (see SETUP.md)

## Steps (15 minutes)

### 1. Create Dockerfile

Create \`Dockerfile\` in project root:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

### 2. Create .dockerignore

\`\`\`dockerignore
node_modules
.next
.git
.env.local
*.log
\`\`\`

### 3. Build Image

\`\`\`bash
docker build -t ${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest .
\`\`\`

### 4. Run Container

\`\`\`bash
docker run -d \\
  --name ${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')} \\
  -p 3000:3000 \\
${envVars.map(v => `  -e ${v.key}=your-key-here \\`).join('\n')}
  ${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest
\`\`\`

### 5. Deploy to Cloud

**Option A: Docker Hub**
\`\`\`bash
docker login
docker tag ${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest yourusername/${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest
docker push yourusername/${agentConfig.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest
\`\`\`

**Option B: Deploy to any cloud provider**
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster

## Verify Deployment

\`\`\`bash
curl http://localhost:3000/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost

**Varies by hosting provider:**
- Self-hosted: Free (your infrastructure)
- Cloud providers: $5-50/month depending on resources

## Features

- ✅ Full control over environment
- ✅ Works on any platform
- ✅ Consistent deployment
- ✅ Easy scaling

## Limitations

- Requires Docker knowledge
- More setup than platform-specific solutions
- Cost depends on infrastructure

## Troubleshooting

**Build fails?**
- Check Dockerfile syntax
- Verify all dependencies are in package.json
- Check Docker logs: \`docker logs <container-name>\`

**Container not starting?**
- Check environment variables are set
- Verify port mapping is correct
- Check container logs

**Need help?**  
- Discord: https://discord.gg/agentex
- Docker Docs: https://docs.docker.com
`,
    estimatedTime: '15 minutes',
    difficulty: 'hard',
    cost: 'Varies by hosting provider',
    prerequisites: ['Docker installed', 'Container registry account', 'All API keys ready']
  };
}
