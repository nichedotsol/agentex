/**
 * Setup Documentation Generator
 * Generates comprehensive setup instructions for agents
 */

import { ToolSpec } from '@/lib/types/tool-spec';
import { generateDeploymentGuide } from './deployment-guide';
import { Runtime } from '@/lib/utils/runtime-selector';

export interface AgentConfig {
  name: string;
  description?: string;
  brain?: string;
  tools?: string[];
  runtime?: string;
  config?: {
    temperature?: number;
    maxTokens?: number;
    cronSchedule?: string;
    timeout?: number;
  };
}

export interface SetupDocumentation {
  setupMd: string;
  envExample: string;
  deploymentGuides: Record<string, string>;
  checklist: {
    setup: string[];
    testing: string[];
    deployment: string[];
  };
}

export interface CostBreakdown {
  service: string;
  cost: string;
}

export interface TotalCost {
  breakdown: CostBreakdown[];
  total: string;
}

/**
 * Generate setup documentation
 */
export function generateSetupDocs(
  agentConfig: AgentConfig,
  tools: ToolSpec[],
  runtime?: Runtime
): SetupDocumentation {
  
  const envVars = tools.flatMap(t => t.requiredEnv);
  const selectedRuntime = agentConfig.runtime || runtime || 'vercel';
  const totalCost = calculateMonthlyCost(tools, selectedRuntime);
  
  // Generate deployment guides for all major platforms
  const deploymentGuides: Record<string, string> = {};
  const platforms: Runtime[] = ['vercel', 'railway', 'render', 'fly.io', 'netlify', 'cloudflare-pages', 'docker'];
  
  for (const platform of platforms) {
    const guide = generateDeploymentGuide(platform, {
      name: agentConfig.name,
      description: agentConfig.description,
      runtime: platform
    }, envVars);
    deploymentGuides[platform] = guide.markdown;
  }
  
  const setupMd = `# Setup Instructions for ${agentConfig.name}

## Overview

${agentConfig.description}

This agent uses:
- **Brain:** ${agentConfig.brain || 'Not specified'}
- **Tools:** ${tools.map(t => t.name).join(', ')}
- **Runtime:** ${selectedRuntime}

## Required Environment Variables

Create a \`.env.local\` file with the following:

\`\`\`bash
${envVars.map(v => `# ${v.purpose}
# Get from: ${v.getFrom}
${v.key}=${v.example || 'your-key-here'}`).join('\n\n')}
\`\`\`

## Quick Start

### 1. Copy environment template

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Fill in your API keys

Edit \`.env.local\` and add all required API keys:

${envVars.map(v => `- **${v.key}**: ${v.purpose}  
  → Get from: [${v.getFrom}](${v.getFrom})`).join('\n')}

### 4. Run development server

\`\`\`bash
npm run dev
\`\`\`

### 5. Test your agent

Visit http://localhost:3000/api/test to verify everything works.

## Estimated Monthly Cost

${totalCost.breakdown.length > 0 
  ? totalCost.breakdown.map(b => `- **${b.service}**: ${b.cost}`).join('\n')
  : 'All services are free tier'
}

**Total Estimated Cost:** ${totalCost.total}

## Troubleshooting

### "Missing API key" error?

→ Check that all keys in \`.env.local\` are filled in and match the exact variable names.

### "Module not found" error?

→ Run \`npm install\` again to ensure all dependencies are installed.

### "Connection refused" or "Network error"?

→ Verify your API keys are valid and have the correct permissions.

### Still having issues?

→ Check our documentation: https://docs.agentex.dev  
→ Join our Discord: https://discord.gg/agentex  
→ Open an issue: https://github.com/agentex/agentex/issues

## Next Steps

1. ✅ Complete setup checklist below
2. ✅ Run integration tests: \`npm test\`
3. ✅ Deploy to production (see DEPLOYMENT.md)
4. ✅ Monitor usage and costs

---

## Setup Checklist

### Initial Setup
${generateChecklist('setup', envVars)}

### Testing
${generateChecklist('testing', [])}

### Deployment
${generateChecklist('deployment', envVars)}
`;

  return {
    setupMd,
    envExample: envVars.map(v => `${v.key}=`).join('\n'),
    deploymentGuides,
    checklist: {
      setup: [
        'Created .env.local file',
        'Added all required API keys',
        'Ran npm install',
        'Development server starts successfully',
        'Can access http://localhost:3000'
      ],
      testing: [
        'Each tool can be called individually',
        'Sample request returns expected response',
        'Error handling works correctly',
        'Logs show correct behavior',
        'All environment variables are loaded'
      ],
      deployment: [
        'Environment variables added to hosting platform',
        'Build succeeds in production',
        'Health check returns 200',
        'First real request works',
        'Monitoring is set up'
      ]
    }
  };
}

/**
 * Calculate monthly cost estimate
 */
export function calculateMonthlyCost(tools: ToolSpec[], runtime: string): TotalCost {
  const breakdown: CostBreakdown[] = [];
  
  // Tool costs
  for (const tool of tools) {
    if (tool.cost.tier === 'paid' || (tool.cost.tier === 'freemium' && tool.cost.paidTier)) {
      breakdown.push({
        service: tool.name,
        cost: tool.cost.estimate || tool.cost.paidTier?.startingAt || 'Check provider pricing'
      });
    }
  }
  
  // Runtime costs
  if (runtime === 'railway' || runtime === 'render') {
    breakdown.push({
      service: 'Hosting (Railway/Render)',
      cost: '$5-20/month'
    });
  } else if (runtime === 'vercel') {
    breakdown.push({
      service: 'Hosting (Vercel)',
      cost: 'Free (Hobby plan)'
    });
  } else if (runtime === 'fly.io') {
    breakdown.push({
      service: 'Hosting (Fly.io)',
      cost: 'Free tier available, paid from $5/month'
    });
  }
  
  // Calculate total
  const hasPaidServices = breakdown.some(b => b.cost.includes('$'));
  let total = 'Free';
  
  if (hasPaidServices) {
    const costs = breakdown
      .filter(b => b.cost.includes('$'))
      .map(b => {
        // Extract first number from cost string
        const match = b.cost.match(/\$(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const sum = costs.reduce((a, b) => a + b, 0);
    total = `~$${sum}+/month`;
  }
  
  return { breakdown, total };
}

/**
 * Generate checklist items
 */
function generateChecklist(type: 'setup' | 'testing' | 'deployment', envVars: any[]): string {
  const items = {
    setup: [
      'Created .env.local file',
      ...envVars.map(v => `Added ${v.key} to .env.local`),
      'Ran npm install',
      'Development server starts successfully'
    ],
    testing: [
      'Each tool can be called individually',
      'Sample request returns expected response',
      'Error handling works',
      'Logs show correct behavior'
    ],
    deployment: [
      'Environment variables added to hosting platform',
      'Build succeeds in production',
      'Health check returns 200',
      'First real request works'
    ]
  };
  
  return items[type].map(item => `- [ ] ${item}`).join('\n');
}
