/**
 * Integration Test Suite Generator
 * Generates comprehensive test suites for agent builds
 */

import { ToolSpec } from '@/lib/types/tool-spec';
import { AgentConfig } from '@/lib/utils/runtime-selector';

export interface TestSuite {
  integrationTests: string;
  testScript: string;
  packageJsonTestConfig: {
    scripts: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  envCheckScript: string;
}

/**
 * Generate complete test suite for an agent
 */
export function generateTests(
  agentConfig: AgentConfig,
  tools: ToolSpec[]
): TestSuite {
  
  const agentName = agentConfig.name || 'Agent';
  const sanitizedName = agentName.replace(/[^a-zA-Z0-9]/g, '');
  
  // Get required environment variables
  const requiredEnv = tools.flatMap(t => t.requiredEnv.filter(e => e.required));
  
  // Generate integration tests
  const integrationTests = generateIntegrationTests(agentConfig, tools, sanitizedName, requiredEnv);
  
  // Generate test script
  const testScript = generateTestScript(agentConfig, requiredEnv);
  
  // Generate environment check script
  const envCheckScript = generateEnvCheckScript(requiredEnv);
  
  // Package.json test configuration
  const packageJsonTestConfig = {
    scripts: {
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage",
      "test:ui": "vitest --ui"
    },
    devDependencies: {
      "vitest": "^1.0.0",
      "@vitest/coverage-v8": "^1.0.0",
      "@vitest/ui": "^1.0.0"
    }
  };
  
  return {
    integrationTests,
    testScript,
    packageJsonTestConfig,
    envCheckScript
  };
}

/**
 * Generate integration test file
 */
function generateIntegrationTests(
  agentConfig: AgentConfig,
  tools: ToolSpec[],
  sanitizedName: string,
  requiredEnv: Array<{ key: string; getFrom: string }>
): string {
  return `// tests/integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { ${sanitizedName} } from '../src/agent';

describe('${agentConfig.name || 'Agent'} Integration Tests', () => {
  
  beforeAll(() => {
    // Check environment variables
    ${requiredEnv.map(e => `
    if (!process.env.${e.key}) {
      throw new Error('${e.key} not set. Get from: ${e.getFrom}');
    }`).join('')}
  });

  ${tools.map(tool => {
    const toolClassName = tool.name.replace(/[^a-zA-Z0-9]/g, '');
    return `
  describe('${tool.name}', () => {
    it('should initialize successfully', async () => {
      const toolInstance = new ${toolClassName}();
      expect(toolInstance).toBeDefined();
    });
    
    ${tool.interface.capabilities.slice(0, 2).map(cap => {
      const methodName = cap.replace(/[^a-zA-Z0-9]/g, '');
      return `
    it('should ${cap}', async () => {
      const toolInstance = new ${toolClassName}();
      // TODO: Add test parameters based on tool requirements
      const result = await toolInstance.${methodName}(/* test params */);
      expect(result).toBeDefined();
    });`;
    }).join('\n')}
  });`;
  }).join('\n')}
  
  it('should handle errors gracefully', async () => {
    const agent = new ${sanitizedName}();
    await expect(agent.process({ invalid: 'input' })).rejects.toThrow();
  });
  
  it('should process valid requests', async () => {
    const agent = new ${sanitizedName}();
    const result = await agent.process({
      message: 'Test request',
      context: {}
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('response');
  });
  
  ${agentConfig.config?.cronSchedule ? `
  it('should handle scheduled tasks', async () => {
    const agent = new ${sanitizedName}();
    // Test cron job execution
    const result = await agent.executeScheduledTask();
    expect(result).toBeDefined();
  });` : ''}
});
`;
}

/**
 * Generate test runner script
 */
function generateTestScript(
  agentConfig: AgentConfig,
  requiredEnv: Array<{ key: string; getFrom: string }>
): string {
  return `#!/bin/bash
# test.sh

echo "🧪 Testing ${agentConfig.name || 'Agent'}..."

# Check environment variables
${requiredEnv.map(e => `
if [ -z "$${e.key}" ]; then
  echo "❌ Missing ${e.key}"
  echo "   Get from: ${e.getFrom}"
  exit 1
fi`).join('')}

echo "✅ All environment variables present"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run tests
echo "🧪 Running integration tests..."
npm test

if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  echo ""
  echo "Next steps:"
  echo "1. Start dev server: npm run dev"
  echo "2. Test endpoint: curl http://localhost:3000/api/test"
  echo "3. Deploy: npm run deploy"
else
  echo "❌ Tests failed. Check output above."
  exit 1
fi
`;
}

/**
 * Generate environment check script
 */
function generateEnvCheckScript(
  requiredEnv: Array<{ key: string; purpose: string; getFrom: string }>
): string {
  return `#!/usr/bin/env node
// scripts/check-env.js

const requiredEnv = ${JSON.stringify(requiredEnv, null, 2)};

console.log('🔍 Checking environment variables...\\n');

let allPresent = true;

for (const env of requiredEnv) {
  const value = process.env[env.key];
  if (!value) {
    console.log(\`❌ \${env.key}\`);
    console.log(\`   Purpose: \${env.purpose}\`);
    console.log(\`   Get from: \${env.getFrom}\`);
    console.log('');
    allPresent = false;
  } else {
    console.log(\`✅ \${env.key} (set)\`);
  }
}

if (!allPresent) {
  console.log('\\n⚠️  Some environment variables are missing.');
  console.log('Create a .env.local file with the required variables.');
  process.exit(1);
}

console.log('\\n✅ All required environment variables are present!');
`;
}

/**
 * Generate Vitest configuration
 */
export function generateVitestConfig(): string {
  return `// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.*',
        'dist/'
      ]
    },
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 30000
  }
});
`;
}

/**
 * Generate test utilities
 */
export function generateTestUtils(): string {
  return `// tests/utils/test-helpers.ts

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create test request
 */
export function createTestRequest(data: any = {}) {
  return {
    message: 'Test request',
    context: {},
    ...data
  };
}

/**
 * Mock fetch for testing
 */
export function mockFetch(response: any) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
    text: async () => JSON.stringify(response)
  });
}
`;
}

/**
 * Merge package.json with test configuration
 */
export function mergePackageJson(existingPackageJson: string, testConfig: TestSuite['packageJsonTestConfig']): string {
  try {
    const pkg = JSON.parse(existingPackageJson);
    return JSON.stringify({
      ...pkg,
      scripts: {
        ...pkg.scripts,
        ...testConfig.scripts
      },
      devDependencies: {
        ...pkg.devDependencies,
        ...testConfig.devDependencies
      }
    }, null, 2);
  } catch {
    // If parsing fails, return a new package.json with test config
    return JSON.stringify({
      name: 'agentex-agent',
      version: '1.0.0',
      scripts: testConfig.scripts,
      devDependencies: testConfig.devDependencies
    }, null, 2);
  }
}
