'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SkillInstallPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'claude' | 'gpt' | 'openclaw' | 'python' | 'typescript'>('claude');
  
  // Add structured data for AI agents
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AgentEX Skill",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "installation": {
        "@type": "HowTo",
        "name": "Install AgentEX Skill",
        "step": [
          {
            "@type": "HowToStep",
            "text": "Install npm package: npm install -g @agentex/skill"
          },
          {
            "@type": "HowToStep",
            "text": "Run installer: agentex-install"
          },
          {
            "@type": "HowToStep",
            "text": "Select your platform (Claude, GPT, or OpenClaw)"
          }
        ]
      },
      "apiEndpoint": "https://agentexs.vercel.app/api/skill/install",
      "documentation": "https://agentexs.vercel.app/skill"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-ax-text mb-4 bg-gradient-to-r from-ax-primary to-ax-secondary bg-clip-text text-transparent">
            Install AgentEX Skill
          </h1>
          <p className="text-xl text-ax-text-secondary max-w-2xl mx-auto mb-6">
            Add AgentEX to your AI agent or application. Build and deploy agents programmatically.
          </p>
          
          {/* Quick Install */}
          <div className="bg-ax-primary/10 border border-ax-primary/20 rounded-xl p-6 max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl font-bold text-ax-text mb-3">Quick Install</h2>
            <p className="text-ax-text-secondary mb-4">Install with a single npm command:</p>
            <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-lg mb-4 text-center">
              npm install -g @agentex/skill
            </code>
            <p className="text-ax-text-secondary mb-4">Then run:</p>
            <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-lg mb-4 text-center">
              agentex-install
            </code>
            <p className="text-sm text-ax-text-secondary">
              Or install locally: <code className="text-ax-primary">npm install @agentex/skill</code>
            </p>
          </div>

          {/* AI Agent Instructions */}
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-ax-text mb-3">🤖 For AI Agents</h2>
            <p className="text-ax-text-secondary mb-4">
              Get installation instructions programmatically via API:
            </p>
            <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
              GET /api/skill/install?platform=claude<br />
              GET /api/skill/install?platform=gpt<br />
              GET /api/skill/install?platform=openclaw<br />
              GET /api/skill/install (all platforms)
            </code>
            <p className="text-sm text-ax-text-secondary mb-2">
              Returns JSON with step-by-step instructions, commands, and file paths.
            </p>
            <Link 
              href="/api/skill/install" 
              className="text-ax-primary hover:text-ax-primary-hover underline text-sm"
              target="_blank"
            >
              View API Response →
            </Link>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {(['claude', 'gpt', 'openclaw', 'python', 'typescript'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              type="button"
              className={`px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all ${
                selectedPlatform === platform
                  ? 'bg-ax-primary text-white shadow-lg shadow-ax-primary/30'
                  : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
              }`}
            >
              {platform === 'claude' && '🤖 Claude'}
              {platform === 'gpt' && '💬 GPT'}
              {platform === 'openclaw' && '🦅 OpenClaw'}
              {platform === 'python' && '🐍 Python'}
              {platform === 'typescript' && '⚡ TypeScript'}
            </button>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-8 mb-8">
          {selectedPlatform === 'claude' && <ClaudeInstructions />}
          {selectedPlatform === 'gpt' && <GPTInstructions />}
          {selectedPlatform === 'openclaw' && <OpenClawInstructions />}
          {selectedPlatform === 'python' && <PythonInstructions />}
          {selectedPlatform === 'typescript' && <TypeScriptInstructions />}
        </div>

        {/* API Reference */}
        <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-ax-text mb-4">API Reference</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-ax-text mb-2">Installation API</h3>
              <p className="text-ax-text-secondary mb-2">
                Get machine-readable installation instructions:
              </p>
              <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-2">
                GET /api/skill/install?platform=claude
              </code>
              <Link 
                href="/api/skill/install" 
                className="text-ax-primary hover:text-ax-primary-hover underline text-sm"
                target="_blank"
              >
                Try it →
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ax-text mb-2">AgentEX Skill API</h3>
              <p className="text-ax-text-secondary mb-2">
                All skill actions use the AgentEX API at:
              </p>
              <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
                https://agentexs.vercel.app/api/agentex/v2
              </code>
              <div>
                <h4 className="text-md font-semibold text-ax-text mb-2">Available Actions</h4>
                <ul className="space-y-2 text-ax-text-secondary">
                  <li><code className="text-ax-primary">validate</code> - Validate agent requirements</li>
                  <li><code className="text-ax-primary">generate</code> - Generate agent code</li>
                  <li><code className="text-ax-primary">status</code> - Check build status</li>
                  <li><code className="text-ax-primary">deploy</code> - Deploy to hosting platform</li>
                  <li><code className="text-ax-primary">search_tools</code> - Search available tools</li>
                  <li><code className="text-ax-primary">get_tool</code> - Get tool details</li>
                </ul>
              </div>
            </div>

            <div>
              <Link 
                href="/api-docs" 
                className="text-ax-primary hover:text-ax-primary-hover underline"
              >
                View Full API Documentation →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Start Examples */}
        <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-ax-text mb-4">Quick Start Examples</h2>
          <div className="space-y-6">
            <ExampleCard
              title="Validate Agent Requirements"
              description="Check if your agent configuration is valid before building"
              code={`{
  "action": "validate",
  "name": "Research Assistant",
  "description": "An AI agent that helps with research tasks",
  "brain": "claude-3-5-sonnet",
  "tools": ["tool-openai-api", "tool-web-search"]
}`}
            />
            <ExampleCard
              title="Generate Agent Code"
              description="Create production-ready agent code"
              code={`{
  "action": "generate",
  "name": "Research Assistant",
  "description": "An AI agent that helps with research tasks",
  "brain": "claude-3-5-sonnet",
  "tools": ["tool-openai-api", "tool-web-search"],
  "runtime": "vercel"
}`}
            />
            <ExampleCard
              title="Search Tools"
              description="Discover available tools by category or capability"
              code={`{
  "action": "search_tools",
  "query": "email",
  "category": "communication"
}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ClaudeInstructions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ax-text mb-4">Install in Claude</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 1: npm Install (Recommended)</h3>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
            npm install -g @agentex/skill<br />
            agentex-install
          </code>
          <p className="text-ax-text-secondary mb-4">
            Select option 1 when prompted to install for Claude.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 2: Direct Import</h3>
          <ol className="list-decimal list-inside space-y-2 text-ax-text-secondary">
            <li>Download the skill file: <code className="text-ax-primary">packages/claude-skill.json</code></li>
            <li>Open Claude Desktop or Claude.ai</li>
            <li>Go to Settings → Skills</li>
            <li>Click &quot;Add Skill&quot; or &quot;Import Skill&quot;</li>
            <li>Select the downloaded JSON file</li>
            <li>The skill will be available as <code className="text-ax-primary">agentex_builder</code></li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Usage Example</h3>
          <div className="bg-ax-bg-secondary p-4 rounded-lg">
            <p className="text-ax-text-secondary mb-2">In Claude, you can now say:</p>
            <code className="text-ax-text font-mono text-sm block">
              &quot;I want to build a research agent. Use the agentex_builder skill to validate and generate it with OpenAI API and web search tools.&quot;
            </code>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Skill File</h3>
          <p className="text-ax-text-secondary mb-2">
            Download: <Link href="/packages/claude-skill.json" className="text-ax-primary hover:underline">claude-skill.json</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GPTInstructions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ax-text mb-4">Install in GPT Assistant</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 1: npm Install (Recommended)</h3>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
            npm install -g @agentex/skill<br />
            agentex-install
          </code>
          <p className="text-ax-text-secondary mb-4">
            Select option 2 when prompted to see GPT installation instructions.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 2: Function Definition</h3>
          <ol className="list-decimal list-inside space-y-2 text-ax-text-secondary">
            <li>Download the function file: <code className="text-ax-primary">packages/gpt-function.json</code></li>
            <li>Open OpenAI Platform → Assistants</li>
            <li>Create or edit an assistant</li>
            <li>Go to Functions section</li>
            <li>Click &quot;Add Function&quot;</li>
            <li>Paste the contents of <code className="text-ax-primary">gpt-function.json</code></li>
            <li>Save the assistant</li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Usage Example</h3>
          <div className="bg-ax-bg-secondary p-4 rounded-lg">
            <p className="text-ax-text-secondary mb-2">In your GPT assistant, you can now call:</p>
            <code className="text-ax-text font-mono text-sm block">
              agentex_builder(action=&quot;validate&quot;, name=&quot;Research Assistant&quot;, description=&quot;Helps with research&quot;, brain=&quot;gpt-4&quot;, tools=[&quot;tool-openai-api&quot;])
            </code>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Function File</h3>
          <p className="text-ax-text-secondary mb-2">
            Download: <Link href="/packages/gpt-function.json" className="text-ax-primary hover:underline">gpt-function.json</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function OpenClawInstructions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ax-text mb-4">Install in OpenClaw</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 1: npm Install (Recommended)</h3>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
            npm install -g @agentex/skill<br />
            agentex-install
          </code>
          <p className="text-ax-text-secondary mb-4">
            Select option 3 when prompted to install for OpenClaw. The installer will automatically:
          </p>
          <ul className="list-disc list-inside space-y-1 text-ax-text-secondary mb-4">
            <li>Create ~/.openclaw/skills directory if it doesn&apos;t exist</li>
            <li>Copy the skill file to ~/.openclaw/skills/agentex_builder.json</li>
            <li>Verify the installation</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 2: Manual Installation</h3>
          <ol className="list-decimal list-inside space-y-2 text-ax-text-secondary">
            <li>Create the skills directory (if it doesn&apos;t exist):</li>
            <code className="block bg-ax-bg-secondary p-3 rounded-lg text-ax-text font-mono text-sm my-2">
              mkdir -p ~/.openclaw/skills
            </code>
            <li>Copy the skill file to your OpenClaw skills directory:</li>
            <code className="block bg-ax-bg-secondary p-3 rounded-lg text-ax-text font-mono text-sm my-2">
              cp packages/openclaw-skill.json ~/.openclaw/skills/agentex_builder.json
            </code>
            <li>Or download from: <Link href="/packages/openclaw-skill.json" className="text-ax-primary hover:underline" target="_blank">openclaw-skill.json</Link></li>
            <li>Restart OpenClaw</li>
            <li>The skill will be available as <code className="text-ax-primary">agentex_builder</code></li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Method 3: Via OpenClaw UI</h3>
          <ol className="list-decimal list-inside space-y-2 text-ax-text-secondary">
            <li>Open OpenClaw</li>
            <li>Go to Settings → Skills</li>
            <li>Click &quot;Import Skill&quot; or &quot;Add Skill&quot;</li>
            <li>Select <code className="text-ax-primary">packages/openclaw-skill.json</code></li>
            <li>Or paste the JSON content directly</li>
            <li>Save and restart OpenClaw</li>
          </ol>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Usage Example</h3>
          <div className="bg-ax-bg-secondary p-4 rounded-lg">
            <code className="text-ax-text font-mono text-sm block">
{`# Validate agent requirements
validation = agentex_builder.validate(
    name="Research Assistant",
    description="Helps with research",
    brain="openclaw",
    tools=["tool-openai-api"]
)

# Generate agent code
result = agentex_builder.generate(
    name="Research Assistant",
    description="Helps with research",
    brain="openclaw",
    tools=["tool-openai-api"],
    runtime="vercel"
)`}
            </code>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Skill File</h3>
          <p className="text-ax-text-secondary mb-2">
            Download: <Link href="/packages/openclaw-skill.json" className="text-ax-primary hover:underline">openclaw-skill.json</Link>
          </p>
          <p className="text-ax-text-secondary">
            Full guide: <Link href="/packages/openclaw-install.md" className="text-ax-primary hover:underline">openclaw-install.md</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PythonInstructions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ax-text mb-4">Python SDK</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Installation</h3>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
            cd packages/python<br />
            pip install .
          </code>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Usage Example</h3>
          <div className="bg-ax-bg-secondary p-4 rounded-lg">
            <code className="text-ax-text font-mono text-sm block whitespace-pre">
{`from agentex import AgentEXClient, ValidateRequest

# Initialize client
client = AgentEXClient()

# Validate agent requirements
request = ValidateRequest(
    name="Research Assistant",
    description="Helps with research",
    brain="openai",
    tools=["tool-openai-api", "tool-web-search"]
)

response = client.validate(request)
print(f"Valid: {response.valid}")
print(f"Recommended runtime: {response.recommendations.runtime.primary}")`}
            </code>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Documentation</h3>
          <p className="text-ax-text-secondary mb-2">
            Full documentation: <Link href="/packages/python/README.md" className="text-ax-primary hover:underline">Python SDK README</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function TypeScriptInstructions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ax-text mb-4">TypeScript/JavaScript SDK</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Installation</h3>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm mb-4">
            cd packages/typescript<br />
            npm install<br />
            npm run build
          </code>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Usage Example</h3>
          <div className="bg-ax-bg-secondary p-4 rounded-lg">
            <code className="text-ax-text font-mono text-sm block whitespace-pre">
{`import { AgentEXClient, ValidateRequest } from '@agentex/sdk';

// Initialize client
const client = new AgentEXClient();

// Validate agent requirements
const request: ValidateRequest = {
  name: "Research Assistant",
  description: "Helps with research",
  brain: "openai",
  tools: ["tool-openai-api", "tool-web-search"]
};

const response = await client.validate(request);
console.log(\`Valid: \${response.valid}\`);
console.log(\`Recommended runtime: \${response.recommendations.runtime?.primary}\`);`}
            </code>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ax-text mb-2">Documentation</h3>
          <p className="text-ax-text-secondary mb-2">
            Full documentation: <Link href="/packages/typescript/README.md" className="text-ax-primary hover:underline">TypeScript SDK README</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ExampleCard({ title, description, code }: { title: string; description: string; code: string }) {
  return (
    <div className="bg-ax-bg-secondary border border-ax-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-ax-text mb-2">{title}</h3>
      <p className="text-ax-text-secondary mb-4">{description}</p>
      <code className="block bg-ax-bg p-4 rounded-lg text-ax-text font-mono text-sm overflow-x-auto">
        {code}
      </code>
    </div>
  );
}
