/**
 * AgentEX Skill Installation API
 * Returns installation instructions in machine-readable format for AI agents
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface InstallationInstructions {
  platform: 'claude' | 'gpt' | 'openclaw' | 'python' | 'typescript';
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
  const platform = searchParams.get('platform') as 'claude' | 'gpt' | 'openclaw' | 'python' | 'typescript' | null;

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
      const openClawSkillContent = await fs.readFile(openClawSkillPath, 'utf-8');

      instructions.push({
        platform: 'openclaw',
        method: 'npm',
        steps: [
          'Install globally: npm install -g @agentex/skill',
          'Run installer: agentex-install',
          'Select option 3 (OpenClaw)',
          'Restart OpenClaw',
          'The skill will be available as "agentex_builder"'
        ],
        commands: [
          'npm install -g @agentex/skill',
          'agentex-install'
        ],
        files: [{
          name: 'openclaw-skill.json',
          path: '/packages/agentex-skill/openclaw-skill.json',
          content: openClawSkillContent
        }],
        verification: [
          'Check that ~/.openclaw/skills/agentex_builder.json exists',
          'Restart OpenClaw and verify skill is available'
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
