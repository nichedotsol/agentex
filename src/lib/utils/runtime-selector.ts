/**
 * Runtime Selection Intelligence
 * Analyzes agent requirements and recommends optimal runtime
 */

import { ToolSpec } from '@/lib/types/tool-spec';

export interface AgentConfig {
  name?: string;
  tools?: ToolSpec[];
  config?: {
    cronSchedule?: string;
    timeout?: number;
    expectedTraffic?: 'low' | 'medium' | 'high';
  };
  description?: string;
}

export interface RuntimeRequirements {
  persistent: boolean;      // Needs to run 24/7
  cron: boolean;            // Scheduled tasks
  websockets: boolean;      // Real-time connections
  longRunning: boolean;     // Tasks > 10 seconds
  traffic: 'low' | 'medium' | 'high';
  database?: boolean;       // Needs persistent database
  fileStorage?: boolean;    // Needs file storage
  highMemory?: boolean;     // Needs high memory
}

export interface RuntimeRecommendation {
  primary: Runtime;
  reasoning: string;
  alternatives: Runtime[];
  costEstimate: string;
  limitations: string[];
  setupDifficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export type Runtime = 'vercel' | 'vercel-cron' | 'railway' | 'render' | 'fly.io' | 'netlify' | 'cloudflare-pages' | 'github-actions' | 'docker';

/**
 * Analyze agent requirements from config
 */
export function analyzeRequirements(
  agentConfig: AgentConfig,
  tools: ToolSpec[] = []
): RuntimeRequirements {
  
  const hasCron = !!(
    agentConfig.config?.cronSchedule ||
    agentConfig.description?.toLowerCase().includes('schedule') ||
    agentConfig.description?.toLowerCase().includes('cron') ||
    agentConfig.description?.toLowerCase().includes('hourly') ||
    agentConfig.description?.toLowerCase().includes('daily') ||
    agentConfig.description?.toLowerCase().includes('periodic')
  );
  
  const hasWebsockets = tools.some(t => 
    t.interface.capabilities.some(cap => 
      cap.toLowerCase().includes('websocket') || 
      cap.toLowerCase().includes('realtime')
    ) ||
    t.name.toLowerCase().includes('websocket') ||
    t.name.toLowerCase().includes('realtime')
  );
  
  const persistent = hasCron || hasWebsockets;
  
  const longRunning = (agentConfig.config?.timeout || 0) > 10;
  
  const hasDatabase = tools.some(t => 
    t.category === 'storage' ||
    t.name.toLowerCase().includes('database') ||
    t.name.toLowerCase().includes('sql') ||
    t.name.toLowerCase().includes('postgres') ||
    t.name.toLowerCase().includes('mongodb')
  );
  
  const hasFileStorage = tools.some(t => 
    t.name.toLowerCase().includes('file') ||
    t.name.toLowerCase().includes('storage') ||
    t.name.toLowerCase().includes('s3')
  );
  
  const highMemory = tools.some(t => 
    t.name.toLowerCase().includes('image') ||
    t.name.toLowerCase().includes('video') ||
    t.name.toLowerCase().includes('processing')
  );
  
  return {
    persistent,
    cron: hasCron,
    websockets: hasWebsockets,
    longRunning,
    traffic: agentConfig.config?.expectedTraffic || 'low',
    database: hasDatabase,
    fileStorage: hasFileStorage,
    highMemory
  };
}

/**
 * Recommend optimal runtime based on requirements
 */
export function recommendRuntime(
  requirements: RuntimeRequirements
): RuntimeRecommendation {
  
  // Persistent jobs need always-on server
  if (requirements.persistent || requirements.websockets) {
    if (requirements.websockets) {
      return {
        primary: 'railway',
        reasoning: 'Your agent uses websockets or real-time connections. Railway provides always-on hosting with full websocket support.',
        alternatives: ['fly.io', 'render'],
        costEstimate: '$5-20/month',
        limitations: ['Requires credit card', 'Manual setup needed'],
        setupDifficulty: 'medium',
        estimatedTime: '10-15 minutes'
      };
    }
    
    return {
      primary: 'railway',
      reasoning: 'Your agent needs to run continuously (scheduled tasks or always-on). Railway provides always-on hosting perfect for persistent agents.',
      alternatives: ['render', 'fly.io'],
      costEstimate: '$5-20/month',
      limitations: ['Requires credit card', 'Manual setup needed'],
      setupDifficulty: 'medium',
      estimatedTime: '10-15 minutes'
    };
  }
  
  // Cron jobs work with serverless cron
  if (requirements.cron) {
    return {
      primary: 'vercel-cron',
      reasoning: 'Scheduled tasks work perfectly with Vercel Cron (serverless). No need for always-on hosting, pay only for execution time.',
      alternatives: ['github-actions', 'railway'],
      costEstimate: 'Free (Hobby plan)',
      limitations: ['Max 1/minute frequency on free tier', '10 second timeout per execution'],
      setupDifficulty: 'easy',
      estimatedTime: '5 minutes'
    };
  }
  
  // Long-running tasks need servers
  if (requirements.longRunning) {
    return {
      primary: 'railway',
      reasoning: 'Tasks longer than 10 seconds need dedicated hosting. Railway provides flexible timeout limits.',
      alternatives: ['render', 'fly.io'],
      costEstimate: '$5-20/month',
      limitations: ['Requires credit card'],
      setupDifficulty: 'medium',
      estimatedTime: '10-15 minutes'
    };
  }
  
  // High traffic needs scalable infrastructure
  if (requirements.traffic === 'high') {
    return {
      primary: 'vercel',
      reasoning: 'High traffic patterns work best with Vercel\'s edge network and auto-scaling serverless functions.',
      alternatives: ['cloudflare-pages', 'netlify'],
      costEstimate: 'Free (Hobby plan) up to 100GB bandwidth',
      limitations: ['10 second timeout', 'No persistent state'],
      setupDifficulty: 'easy',
      estimatedTime: '5 minutes'
    };
  }
  
  // Database requirements
  if (requirements.database) {
    return {
      primary: 'railway',
      reasoning: 'Database requirements work best with Railway\'s integrated database services and persistent storage.',
      alternatives: ['render', 'fly.io'],
      costEstimate: '$5-20/month (includes database)',
      limitations: ['Requires credit card'],
      setupDifficulty: 'medium',
      estimatedTime: '10-15 minutes'
    };
  }
  
  // File storage requirements
  if (requirements.fileStorage) {
    return {
      primary: 'railway',
      reasoning: 'File storage needs persistent volumes. Railway provides integrated storage solutions.',
      alternatives: ['render', 'fly.io'],
      costEstimate: '$5-20/month',
      limitations: ['Requires credit card'],
      setupDifficulty: 'medium',
      estimatedTime: '10-15 minutes'
    };
  }
  
  // High memory requirements
  if (requirements.highMemory) {
    return {
      primary: 'railway',
      reasoning: 'High memory requirements (image/video processing) need dedicated resources. Railway offers flexible resource allocation.',
      alternatives: ['render', 'fly.io'],
      costEstimate: '$10-30/month',
      limitations: ['Requires credit card'],
      setupDifficulty: 'medium',
      estimatedTime: '10-15 minutes'
    };
  }
  
  // Default: simple request/response
  return {
    primary: 'vercel',
    reasoning: 'Simple request/response patterns work perfectly on Vercel serverless functions. Fast, free, and easy to deploy.',
    alternatives: ['netlify', 'cloudflare-pages'],
    costEstimate: 'Free (Hobby plan)',
    limitations: ['10 second timeout', 'No persistent state', 'Cold starts possible'],
    setupDifficulty: 'easy',
    estimatedTime: '5 minutes'
  };
}

/**
 * Check runtime compatibility with requirements
 */
export function checkRuntimeCompatibility(
  runtime: Runtime,
  requirements: RuntimeRequirements
): { compatible: boolean; reason: string; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check persistent requirements
  if (requirements.persistent && (runtime === 'vercel' || runtime === 'netlify' || runtime === 'cloudflare-pages')) {
    return {
      compatible: false,
      reason: `${runtime} serverless functions cannot run persistently. Use Railway, Render, or Fly.io for always-on hosting.`,
      warnings: []
    };
  }
  
  // Check websocket requirements
  if (requirements.websockets && (runtime === 'vercel' || runtime === 'netlify' || runtime === 'cloudflare-pages')) {
    return {
      compatible: false,
      reason: `${runtime} does not support websockets. Use Railway, Render, or Fly.io for websocket support.`,
      warnings: []
    };
  }
  
  // Check long-running tasks
  if (requirements.longRunning && (runtime === 'vercel' || runtime === 'netlify' || runtime === 'cloudflare-pages')) {
    return {
      compatible: false,
      reason: `${runtime} has a 10-second timeout limit. Tasks longer than 10 seconds need Railway, Render, or Fly.io.`,
      warnings: []
    };
  }
  
  // Check cron requirements
  if (requirements.cron && runtime === 'vercel' && !runtime.includes('cron')) {
    warnings.push('Consider using vercel-cron for scheduled tasks instead of regular vercel runtime.');
  }
  
  // Check database requirements
  if (requirements.database && (runtime === 'vercel' || runtime === 'netlify' || runtime === 'cloudflare-pages')) {
    warnings.push(`${runtime} doesn't provide integrated databases. You'll need to use an external database service.`);
  }
  
  return {
    compatible: true,
    reason: '',
    warnings
  };
}

/**
 * Get cost estimate for a specific runtime
 */
export function getRuntimeCost(runtime: Runtime, requirements: RuntimeRequirements): {
  tier: 'free' | 'freemium' | 'paid';
  estimate: string;
  breakdown: string[];
} {
  const costs: Record<Runtime, { tier: 'free' | 'freemium' | 'paid'; estimate: string; breakdown: string[] }> = {
    'vercel': {
      tier: 'free',
      estimate: 'Free (Hobby plan)',
      breakdown: [
        '100GB bandwidth/month',
        'Unlimited serverless function invocations',
        'Edge network included'
      ]
    },
    'vercel-cron': {
      tier: 'free',
      estimate: 'Free (Hobby plan)',
      breakdown: [
        'Cron jobs included',
        'Max 1 execution per minute on free tier',
        '10 second timeout per execution'
      ]
    },
    'railway': {
      tier: 'freemium',
      estimate: '$5-20/month',
      breakdown: [
        '$5/month starter plan (500 hours)',
        'Always-on hosting',
        'Integrated databases available',
        'Flexible resource allocation'
      ]
    },
    'render': {
      tier: 'freemium',
      estimate: '$7-25/month',
      breakdown: [
        '$7/month starter plan',
        'Always-on hosting',
        'Free tier available (spins down after inactivity)',
        'Integrated databases available'
      ]
    },
    'fly.io': {
      tier: 'freemium',
      estimate: '$5-15/month',
      breakdown: [
        'Free tier available (3 shared-cpu VMs)',
        'Pay-as-you-go pricing',
        'Global edge deployment',
        'Always-on hosting'
      ]
    },
    'netlify': {
      tier: 'free',
      estimate: 'Free (Starter plan)',
      breakdown: [
        '100GB bandwidth/month',
        'Unlimited serverless function invocations',
        '10 second timeout'
      ]
    },
    'cloudflare-pages': {
      tier: 'free',
      estimate: 'Free',
      breakdown: [
        'Unlimited requests',
        'Unlimited bandwidth',
        '10 second timeout',
        'Global edge network'
      ]
    },
    'github-actions': {
      tier: 'free',
      estimate: 'Free (for public repos)',
      breakdown: [
        '2,000 minutes/month free',
        'Perfect for scheduled tasks',
        'No hosting costs'
      ]
    },
    'docker': {
      tier: 'paid',
      estimate: 'Varies by hosting provider',
      breakdown: [
        'Self-hosted or cloud provider',
        'Full control over resources',
        'Cost depends on infrastructure'
      ]
    }
  };
  
  return costs[runtime] || {
    tier: 'paid',
    estimate: 'Check provider pricing',
    breakdown: []
  };
}

/**
 * Generate deployment guide for recommended runtime
 */
export function generateDeploymentGuide(
  recommendation: RuntimeRecommendation,
  agentConfig: AgentConfig,
  envVars: Array<{ key: string; purpose: string; getFrom: string }>
): string {
  const cost = getRuntimeCost(recommendation.primary, analyzeRequirements(agentConfig));
  
  const guides: Partial<Record<Runtime, string>> = {
    'vercel': `# Deploy to Vercel

## Prerequisites
- [ ] GitHub account
- [ ] All API keys ready (see SETUP.md)

## Steps (${recommendation.estimatedTime})

### 1. Push to GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name || 'agent'} setup"

# Create repo (using GitHub CLI)
gh repo create ${(agentConfig.name || 'agentex-agent').toLowerCase()} --public --source=. --push
\`\`\`

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo
4. Click "Import"

### 3. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`your-${v.key.toLowerCase()}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 4. Deploy
1. Click "Deploy"
2. Wait ~2 minutes
3. Your agent is live at: \`${(agentConfig.name || 'agentex-agent').toLowerCase()}.vercel.app\`

## Verify Deployment

\`\`\`bash
curl https://${(agentConfig.name || 'agentex-agent').toLowerCase()}.vercel.app/api/health
# Should return: {"status": "ok"}
\`\`\`

## Cost
${cost.estimate}

${cost.breakdown.map(b => `- ${b}`).join('\n')}

## Limitations
${recommendation.limitations.map(l => `- ${l}`).join('\n')}

## Troubleshooting

**Build fails?**
- Check Vercel build logs for missing dependencies
- Verify all environment variables are set

**Runtime errors?**
- Check Vercel function logs
- Verify API keys are correct

**Need help?**  
Discord: discord.gg/agentex
`,

    'vercel-cron': `# Deploy to Vercel with Cron

## Prerequisites
- [ ] GitHub account
- [ ] All API keys ready (see SETUP.md)

## Steps (${recommendation.estimatedTime})

### 1. Push to GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial ${agentConfig.name || 'agent'} setup"
gh repo create ${(agentConfig.name || 'agentex-agent').toLowerCase()} --public --source=. --push
\`\`\`

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo
4. Click "Import"

### 3. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

${envVars.map(v => `**${v.key}**
- Value: \`your-${v.key.toLowerCase()}\`
- Get from: ${v.getFrom}
`).join('\n')}

### 4. Configure Cron Job
Create \`vercel.json\`:
\`\`\`json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "${agentConfig.config?.cronSchedule || '0 * * * *'}"
  }]
}
\`\`\`

### 5. Deploy
1. Click "Deploy"
2. Wait ~2 minutes
3. Cron job will run automatically

## Cost
${cost.estimate}

## Limitations
${recommendation.limitations.map(l => `- ${l}`).join('\n')}
`,

    'railway': `# Deploy to Railway

## Prerequisites
- [ ] Railway account (https://railway.app)
- [ ] Credit card (for paid plans)
- [ ] All API keys ready (see SETUP.md)

## Steps (${recommendation.estimatedTime})

### 1. Install Railway CLI
\`\`\`bash
npm install -g @railway/cli
railway login
\`\`\`

### 2. Initialize Project
\`\`\`bash
railway init
# Select: "Empty Project"
# Name: ${agentConfig.name || 'agentex-agent'}
\`\`\`

### 3. Set Environment Variables
\`\`\`bash
${envVars.map(v => `railway variables set ${v.key}=your-key-here`).join('\n')}
\`\`\`

### 4. Deploy
\`\`\`bash
railway up
\`\`\`

### 5. Get URL
\`\`\`bash
railway domain
# Your agent URL will be displayed
\`\`\`

## Cost
${cost.estimate}

${cost.breakdown.map(b => `- ${b}`).join('\n')}

## Verify Deployment
\`\`\`bash
curl https://your-app.railway.app/api/health
\`\`\`

## Limitations
${recommendation.limitations.map(l => `- ${l}`).join('\n')}
`
  };
  
  return guides[recommendation.primary] || `# Deploy to ${recommendation.primary}

## Prerequisites
- [ ] All API keys ready (see SETUP.md)

## Steps

See deployment documentation for ${recommendation.primary}:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs
- Netlify: https://docs.netlify.com
- Cloudflare Pages: https://developers.cloudflare.com/pages
- GitHub Actions: https://docs.github.com/en/actions

## Cost
${cost.estimate}

## Limitations
${recommendation.limitations.map(l => `- ${l}`).join('\n')}
`;
}
