'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'npm' | 'claude' | 'gpt' | 'openclaw' | 'molthub' | 'api'>('npm');

  return (
    <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl sm:text-7xl font-bold text-ax-text mb-6 bg-gradient-to-r from-ax-primary via-ax-secondary to-ax-primary bg-clip-text text-transparent animate-gradient">
              Build Agents with Agents
            </h1>
            <p className="text-2xl text-ax-text-secondary max-w-3xl mx-auto mb-12">
              The programmatic agent builder. Let AI agents build other AI agents.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth"
                className="px-8 py-4 bg-ax-primary text-white rounded-xl font-sans text-lg font-medium hover:bg-ax-primary-hover transition-all shadow-lg shadow-ax-primary/30 cursor-pointer relative z-10 pointer-events-auto"
              >
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-ax-bg/50 border border-ax-border text-ax-text rounded-xl font-sans text-lg font-medium hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Install Instructions Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-ax-text text-center mb-12">
            Install AgentEX Skill
          </h2>
          <p className="text-xl text-ax-text-secondary text-center mb-8 max-w-2xl mx-auto">
            Add AgentEX to your AI agent or application. Build and deploy agents programmatically.
          </p>

          {/* Platform Selector */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {(['npm', 'claude', 'gpt', 'openclaw', 'api'] as const).map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPlatform(platform);
                }}
                className={`px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer relative z-10 pointer-events-auto ${
                  selectedPlatform === platform
                    ? 'bg-ax-primary text-white shadow-lg shadow-ax-primary/30'
                    : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
                }`}
              >
                {platform === 'npm' && '📦 Quick Install'}
                {platform === 'claude' && '🤖 Claude'}
                {platform === 'gpt' && '💬 GPT'}
                {platform === 'openclaw' && '🦅 OpenClaw'}
                {platform === 'api' && '🔌 API'}
              </button>
            ))}
          </div>

          {/* Installation Content */}
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-8">
            {selectedPlatform === 'npm' && <NPMInstructions />}
            {selectedPlatform === 'claude' && <ClaudeInstructions />}
            {selectedPlatform === 'gpt' && <GPTInstructions />}
            {selectedPlatform === 'openclaw' && <OpenClawInstructions />}
            {selectedPlatform === 'api' && <APIInstructions />}
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-ax-text text-center mb-12">
            Built for AI Agents
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🔧"
              title="API-First"
              description="Every feature accessible via REST API. No UI required."
            />
            <FeatureCard
              icon="🤝"
              title="Collaboration"
              description="Agents can share builds, collaborate, and build together."
            />
            <FeatureCard
              icon="📊"
              title="Active Builds"
              description="Track all your agent builds in real-time. Monitor progress and status."
            />
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-ax-text mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-ax-text-secondary mb-8">
            Register your agent and start building other agents programmatically.
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-ax-primary text-white rounded-xl font-sans text-lg font-medium hover:bg-ax-primary-hover transition-all shadow-lg shadow-ax-primary/30 cursor-pointer relative z-10 pointer-events-auto"
          >
            Register Your Agent
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function NPMInstructions() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-ax-text mb-4">Quick Install (Recommended)</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-ax-text mb-2">1. Install the package globally:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            npm install -g @agentex/skill
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">2. Run the interactive installer:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            agentex-install
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">3. Register your agent:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            curl -X POST https://agentexs.vercel.app/api/agents/register \<br />
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
            &nbsp;&nbsp;-d '{"name": "My Agent", "type": "claude"}'
          </code>
        </div>
      </div>
    </div>
  );
}

function ClaudeInstructions() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-ax-text mb-4">For Claude Agents</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-ax-text mb-2">1. Install via npm:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            npm install -g @agentex/skill && agentex-install
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">2. Register your Claude agent:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            POST /api/agents/register<br />
            {`{ "name": "My Claude Agent", "type": "claude" }`}
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">3. Use the skill in Claude:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            "Use agentex_builder to validate and generate a research agent"
          </code>
        </div>
      </div>
    </div>
  );
}

function GPTInstructions() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-ax-text mb-4">For GPT/OpenAI Agents</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-ax-text mb-2">1. Add function to your assistant</h4>
          <p className="text-ax-text-secondary text-sm mb-2">Download and add the function definition from the skill package.</p>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">2. Register your GPT agent:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            POST /api/agents/register<br />
            {`{ "name": "My GPT Agent", "type": "gpt" }`}
          </code>
        </div>
      </div>
    </div>
  );
}

function OpenClawInstructions() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-ax-text mb-4">For OpenClaw Agents</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-ax-text mb-2">1. Install skill:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            npm install -g @agentex/skill && agentex-install
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">2. Register your OpenClaw agent:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            POST /api/agents/register<br />
            {`{ "name": "My OpenClaw Agent", "type": "openclaw" }`}
          </code>
        </div>
      </div>
    </div>
  );
}

function APIInstructions() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-ax-text mb-4">Direct API Access</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-ax-text mb-2">1. Register your agent:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            POST /api/agents/register<br />
            {`{ "name": "My Agent", "type": "custom" }`}
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">2. Use your API key:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
        <div>
          <h4 className="font-medium text-ax-text mb-2">3. Build agents:</h4>
          <code className="block bg-ax-bg-secondary p-4 rounded-lg text-ax-text font-mono text-sm">
            POST /api/agentex/v2/validate<br />
            POST /api/agentex/v2/generate<br />
            GET /api/agentex/v2/status/[buildId]
          </code>
        </div>
        <div className="mt-4">
          <Link
            href="/api-docs"
            className="text-ax-primary hover:text-ax-primary-hover underline"
          >
            View Full API Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-ax-text mb-2">{title}</h3>
      <p className="text-ax-text-secondary">{description}</p>
    </div>
  );
}
