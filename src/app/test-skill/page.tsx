'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  message?: string;
  response?: any;
  error?: string;
}

export default function SkillTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  const API_BASE = `${baseUrl}/api/agentex/v2`;
  const SKILL_INSTALL_API = `${baseUrl}/api/skill/install`;

  const updateResult = (name: string, updates: Partial<TestResult>) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, ...updates } : r);
      }
      return [...prev, { name, status: 'pending', ...updates }];
    });
  };

  const testEndpoint = async (
    name: string,
    method: string,
    url: string,
    data?: any,
    expectedStatus: number = 200
  ) => {
    updateResult(name, { status: 'running' });

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json().catch(() => response.text());

      if (response.status === expectedStatus) {
        updateResult(name, {
          status: 'pass',
          message: `HTTP ${response.status}`,
          response: responseData,
        });
        return true;
      } else {
        updateResult(name, {
          status: 'fail',
          message: `HTTP ${response.status} (expected ${expectedStatus})`,
          response: responseData,
        });
        return false;
      }
    } catch (error) {
      updateResult(name, {
        status: 'fail',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  };

  const runAllTests = async () => {
    console.log('runAllTests called');
    setIsRunning(true);
    setResults([]);
    
    try {

    // 1. Installation API Tests
    await testEndpoint('Install API - All platforms', 'GET', SKILL_INSTALL_API);
    await testEndpoint('Install API - Claude', 'GET', `${SKILL_INSTALL_API}?platform=claude`);
    await testEndpoint('Install API - GPT', 'GET', `${SKILL_INSTALL_API}?platform=gpt`);
    await testEndpoint('Install API - OpenClaw', 'GET', `${SKILL_INSTALL_API}?platform=openclaw`);
    await testEndpoint('Install API - Python', 'GET', `${SKILL_INSTALL_API}?platform=python`);
    await testEndpoint('Install API - TypeScript', 'GET', `${SKILL_INSTALL_API}?platform=typescript`);

    // 2. Tool Discovery Tests
    await testEndpoint('Search Tools - All', 'POST', `${API_BASE}/tools/search`, { query: '' });
    await testEndpoint('Search Tools - Email', 'POST', `${API_BASE}/tools/search`, { query: 'email' });
    await testEndpoint('Search Tools - Category', 'POST', `${API_BASE}/tools/search`, { category: 'communication' });
    await testEndpoint('Get Tool - Resend Email', 'GET', `${API_BASE}/tools/tool-resend-email`);

    // 3. Validation Test
    const validateData = {
      action: 'validate',
      name: 'Test Agent',
      description: 'A test agent for validation',
      brain: 'claude-3-5-sonnet',
      tools: ['tool-resend-email', 'tool-web-search'],
    };
    await testEndpoint('Validate Agent', 'POST', `${API_BASE}/validate`, validateData);

    // 4. Code Generation Test
    const generateData = {
      name: 'Test Agent',
      description: 'A test agent for code generation',
      brain: 'claude-3-5-sonnet',
      tools: ['tool-resend-email'],
      runtime: 'vercel',
    };
    
    const generateResult = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generateData),
    });

    if (generateResult.ok) {
      const generateResponse = await generateResult.json();
      const buildId = generateResponse.buildId;
      
      updateResult('Generate Agent Code', {
        status: 'pass',
        message: `HTTP ${generateResult.status}`,
        response: { buildId, ...generateResponse },
      });

      // 5. Build Status Tests
      await testEndpoint('Check Build Status', 'GET', `${API_BASE}/status/${buildId}`);
      
      // Wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      await testEndpoint('Check Build Status (after wait)', 'GET', `${API_BASE}/status/${buildId}`);
    } else {
      updateResult('Generate Agent Code', {
        status: 'fail',
        message: `HTTP ${generateResult.status}`,
        error: await generateResult.text(),
      });
    }

    // 6. Error Handling Tests
    await testEndpoint('Validate - Missing Fields', 'POST', `${API_BASE}/validate`, { action: 'validate' }, 400);
    await testEndpoint('Get Tool - Invalid', 'GET', `${API_BASE}/tools/invalid-tool-id`, undefined, 404);

    setIsRunning(false);
    } catch (error) {
      console.error('Test suite error:', error);
      setIsRunning(false);
      updateResult('Test Suite', {
        status: 'fail',
        message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-ax-text mb-4 bg-gradient-to-r from-ax-primary to-ax-secondary bg-clip-text text-transparent">
            Skill Testing Suite
          </h1>
          <p className="text-xl text-ax-text-secondary mb-6">
            Test all AgentEX skill endpoints in your browser
          </p>

          {/* Base URL Input */}
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-4 max-w-md mx-auto mb-6">
            <label className="block text-sm font-medium text-ax-text mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBaseUrl(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 bg-ax-bg-secondary border border-ax-border rounded-lg text-ax-text font-mono text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 cursor-text relative z-10 pointer-events-auto"
              placeholder="http://localhost:3000"
              disabled={isRunning}
            />
          </div>

          {/* Run Button */}
          <div className="relative z-50 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                console.log('Button clicked, calling runAllTests');
                runAllTests().catch(err => {
                  console.error('Error running tests:', err);
                });
              }}
              disabled={isRunning}
              className="px-8 py-4 bg-ax-primary text-white rounded-xl font-sans text-lg font-medium hover:bg-ax-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ax-primary/30 cursor-pointer"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {total > 0 && (
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-ax-text mb-4">Test Results</h2>
            <div className="flex gap-6">
              <div>
                <div className="text-3xl font-bold text-ax-text">{total}</div>
                <div className="text-sm text-ax-text-secondary">Total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">{passed}</div>
                <div className="text-sm text-ax-text-secondary">Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500">{failed}</div>
                <div className="text-sm text-ax-text-secondary">Failed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-ax-text">
                  {total > 0 ? Math.round((passed / total) * 100) : 0}%
                </div>
                <div className="text-sm text-ax-text-secondary">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-ax-text">{result.name}</h3>
                <div className="flex items-center gap-2">
                  {result.status === 'running' && (
                    <div className="w-4 h-4 border-2 border-ax-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {result.status === 'pass' && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium">
                      ✓ PASS
                    </span>
                  )}
                  {result.status === 'fail' && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm font-medium">
                      ✗ FAIL
                    </span>
                  )}
                  {result.status === 'pending' && (
                    <span className="px-3 py-1 bg-ax-bg-secondary text-ax-text-secondary rounded-lg text-sm font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {result.message && (
                <p className="text-sm text-ax-text-secondary mb-3">{result.message}</p>
              )}

              {result.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-3">
                  <p className="text-sm text-red-500 font-mono">{result.error}</p>
                </div>
              )}

              {result.response && (
                <details className="mt-3">
                  <summary 
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer text-sm text-ax-primary hover:text-ax-primary-hover relative z-10 pointer-events-auto"
                  >
                    View Response
                  </summary>
                  <pre className="mt-2 p-4 bg-ax-bg-secondary rounded-lg text-xs text-ax-text overflow-x-auto max-h-64 overflow-y-auto">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </details>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && !isRunning && (
          <div className="text-center py-12">
            <p className="text-ax-text-secondary text-lg">
              Click "Run All Tests" to start testing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
