/**
 * AgentEX Skill Installation API
 * Returns installation instructions in machine-readable format for AI agents
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface InstallationInstructions {
  platform: 'claude' | 'gpt' | 'openclaw' | 'molthub' | 'python' | 'typescript';
  method: 'npm' | 'manual' | 'sdk';
  steps: string[];
  files?: {
    name: string;
    path: string;
    content?: string;
  }[];
  commands?: string[];
  verification?: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') as 'claude' | 'gpt' | 'openclaw' | 'molthub' | 'python' | 'typescript' | null;

  try {
    const instructions: InstallationInstructions[] = [];

    // Claude instructions
    if (!platform || platform === 'claude') {
      const claudeSkillPath = path.join(process.cwd(), 'packages', 'agentex-skill', 'claude-skill.json');
      const claudeSkillContent = await fs.readFile(claudeSkillPath, 'utf-8');

      instructions.push({
        platform: 'claude',
        method: 'npm',
        steps: [
          'Install globally: npm install -g @agentex/skill',
          'Run installer: agentex-install',
          'Select option 1 (Claude)',
          'Restart Claude Desktop',
          'The skill will be available as "agentex_builder"'
        ],
        commands: [
          'npm install -g @agentex/skill',
          'agentex-install'
        ],
        files: [{
          name: 'claude-skill.json',
          path: '/packages/agentex-skill/claude-skill.json',
          content: claudeSkillContent
        }],
        verification: [
          'Check that ~/.config/claude/skills/agentex_builder.json exists (Linux/Mac)',
          'Or %APPDATA%/Claude/skills/agentex_builder.json (Windows)',
          'Restart Claude and verify skill appears in settings'
        ]
      });
    }

    // GPT instructions
    if (!platform || platform === 'gpt') {
      const gptFunctionPath = path.join(process.cwd(), 'packages', 'agentex-skill', 'gpt-function.json');
      const gptFunctionContent = await fs.readFile(gptFunctionPath, 'utf-8');

      instructions.push({
        platform: 'gpt',
        method: 'manual',
        steps: [
          'Open OpenAI Platform → Assistants',
          'Select your assistant',
          'Go to "Functions" tab',
          'Click "Add Function"',
          'Paste the contents of gpt-function.json',
          'Save the assistant'
        ],
        commands: [
          'npm install -g @agentex/skill',
          'cat node_modules/@agentex/skill/gpt-function.json'
        ],
        files: [{
          name: 'gpt-function.json',
          path: '/packages/agentex-skill/gpt-function.json',
          content: gptFunctionContent
        }],
        verification: [
          'Verify function appears in assistant functions list',
          'Test by calling agentex_builder function'
        ]
      });
    }

    // OpenClaw instructions
    if (!platform || platform === 'openclaw') {
      const openClawSkillPath = path.join(process.cwd(), 'packages', 'agentex-skill', 'openclaw-skill.json');
      let openClawSkillContent = '';
      try {
        openClawSkillContent = await fs.readFile(openClawSkillPath, 'utf-8');
      } catch {
        // Fallback to root packages directory
        const altPath = path.join(process.cwd(), 'packages', 'openclaw-skill.json');
        openClawSkillContent = await fs.readFile(altPath, 'utf-8');
      }

      instructions.push({
        platform: 'openclaw',
        method: 'npm',
        steps: [
          'Install globally: npm install -g @agentex/skill',
          'Run installer: agentex-install',
          'Select option 3 (OpenClaw)',
          'The installer will copy the skill file to ~/.openclaw/skills/agentex_builder.json',
          'Restart OpenClaw',
          'The skill will be available as "agentex_builder"',
          'Verify installation by checking if the skill appears in OpenClaw settings'
        ],
        commands: [
          'npm install -g @agentex/skill',
          'agentex-install',
          '# Or manually:',
          'mkdir -p ~/.openclaw/skills',
          'cp node_modules/@agentex/skill/openclaw-skill.json ~/.openclaw/skills/agentex_builder.json'
        ],
        files: [{
          name: 'openclaw-skill.json',
          path: '/packages/agentex-skill/openclaw-skill.json',
          content: openClawSkillContent
        }],
        verification: [
          'Check that ~/.openclaw/skills/agentex_builder.json exists',
          'Verify file contains valid JSON with "name": "agentex_builder"',
          'Restart OpenClaw',
          'Check OpenClaw settings → Skills to see if agentex_builder is listed',
          'Test by calling: agentex_builder.validate(...) in OpenClaw'
        ]
      });
    }

    // MoltHub instructions
    if (!platform || platform === 'molthub') {
      instructions.push({
        platform: 'molthub',
        method: 'npm',
        steps: [
          'Install globally: npm install -g @agentex/skill',
          'Run installer: agentex-install',
          'Select MoltHub option (if available)',
          'Or manually add AgentEX skill to your MoltHub agent configuration',
          'Register your MoltHub agent: POST /api/agents/register with type "molthub"',
          'Use the API key for authenticated requests'
        ],
        commands: [
          'npm install -g @agentex/skill',
          'agentex-install',
          '# Register agent:',
          'curl -X POST https://agentexs.vercel.app/api/agents/register \\',
          '  -H "Content-Type: application/json" \\',
          '  -d \'{"name": "My MoltHub Agent", "type": "molthub"}\''
        ],
        verification: [
          'Verify API key received from registration',
          'Test authentication: GET /api/agents/me with Authorization header',
          'Test agent building: POST /api/agentex/v2/validate with API key'
        ]
      });
    }

    // Python SDK instructions
    if (!platform || platform === 'python') {
      instructions.push({
        platform: 'python',
        method: 'sdk',
        steps: [
          'Install from source: cd packages/python && pip install .',
          'Or install from PyPI (when published): pip install agentex',
          'Import and use: from agentex import AgentEXClient'
        ],
        commands: [
          'cd packages/python',
          'pip install .',
          'python -c "from agentex import AgentEXClient; print(\'Installed\')"'
        ],
        verification: [
          'Run: python -c "from agentex import AgentEXClient"',
          'Should not produce any errors'
        ]
      });
    }

    // TypeScript SDK instructions
    if (!platform || platform === 'typescript') {
      instructions.push({
        platform: 'typescript',
        method: 'sdk',
        steps: [
          'Install from source: cd packages/typescript && npm install && npm run build',
          'Or install from npm (when published): npm install @agentex/sdk',
          'Import and use: import { AgentEXClient } from "@agentex/sdk"'
        ],
        commands: [
          'cd packages/typescript',
          'npm install',
          'npm run build',
          'npm test'
        ],
        verification: [
          'Run: npm test',
          'Should pass all tests'
        ]
      });
    }

    return NextResponse.json({
      success: true,
      instructions,
      npmPackage: '@agentex/skill',
      apiBaseUrl: 'https://agentexs.vercel.app/api/agentex/v2',
      documentation: 'https://agentexs.vercel.app/skill',
      version: '1.0.0'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
