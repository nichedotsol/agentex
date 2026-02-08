#!/usr/bin/env node

/**
 * AgentEX Skill Testing Script (Node.js)
 * Tests all skill endpoints and installation
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/agentex/v2`;
const SKILL_INSTALL_API = `${BASE_URL}/api/skill/install`;

let PASSED = 0;
let FAILED = 0;

// Colors for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, body: body, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  process.stdout.write(`Testing ${name}... `);
  
  try {
    const response = await makeRequest(method, url, data);
    
    if (response.status === expectedStatus) {
      log(`✓ PASS (HTTP ${response.status})`, 'green');
      PASSED++;
      return true;
    } else {
      log(`✗ FAIL (HTTP ${response.status}, expected ${expectedStatus})`, 'red');
      console.log(`  Response: ${JSON.stringify(response.body).substring(0, 200)}`);
      FAILED++;
      return false;
    }
  } catch (error) {
    log(`✗ FAIL (Error: ${error.message})`, 'red');
    FAILED++;
    return false;
  }
}

async function runTests() {
  log('🧪 AgentEX Skill Testing', 'cyan');
  log('========================', 'cyan');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Base: ${API_BASE}\n`);

  // 1. Installation API
  log('1. Testing Installation API', 'yellow');
  console.log('----------------------------');
  
  await testEndpoint('Install API - All platforms', 'GET', SKILL_INSTALL_API);
  await testEndpoint('Install API - Claude', 'GET', `${SKILL_INSTALL_API}?platform=claude`);
  await testEndpoint('Install API - GPT', 'GET', `${SKILL_INSTALL_API}?platform=gpt`);
  await testEndpoint('Install API - OpenClaw', 'GET', `${SKILL_INSTALL_API}?platform=openclaw`);
  await testEndpoint('Install API - Python', 'GET', `${SKILL_INSTALL_API}?platform=python`);
  await testEndpoint('Install API - TypeScript', 'GET', `${SKILL_INSTALL_API}?platform=typescript`);

  console.log('');

  // 2. Tool Discovery
  log('2. Testing Tool Discovery', 'yellow');
  console.log('------------------------');
  
  await testEndpoint('Search Tools - All', 'POST', `${API_BASE}/tools/search`, { query: '' });
  await testEndpoint('Search Tools - Email', 'POST', `${API_BASE}/tools/search`, { query: 'email' });
  await testEndpoint('Search Tools - Category', 'POST', `${API_BASE}/tools/search`, { category: 'communication' });
  await testEndpoint('Get Tool - Resend Email', 'GET', `${API_BASE}/tools/tool-resend-email`);

  console.log('');

  // 3. Validation
  log('3. Testing Validation', 'yellow');
  console.log('---------------------');
  
  const validateData = {
    action: 'validate',
    name: 'Test Agent',
    description: 'A test agent for validation',
    brain: 'claude-3-5-sonnet',
    tools: ['tool-resend-email', 'tool-web-search']
  };
  
  await testEndpoint('Validate Agent', 'POST', `${API_BASE}/validate`, validateData);

  console.log('');

  // 4. Code Generation
  log('4. Testing Code Generation', 'yellow');
  console.log('---------------------------');
  
  const generateData = {
    name: 'Test Agent',
    description: 'A test agent for code generation',
    brain: 'claude-3-5-sonnet',
    tools: ['tool-resend-email'],
    runtime: 'vercel'
  };
  
  const generateResult = await makeRequest('POST', `${API_BASE}/generate`, generateData);
  if (generateResult.status === 200) {
    log(`✓ Generate Agent Code (HTTP ${generateResult.status})`, 'green');
    const buildId = generateResult.body.buildId;
    console.log(`  Build ID: ${buildId}`);
    PASSED++;

    console.log('');
    log('5. Testing Build Status', 'yellow');
    console.log('-----------------------');
    
    await testEndpoint('Check Build Status', 'GET', `${API_BASE}/status/${buildId}`);
    
    console.log('  Waiting 5 seconds for generation to progress...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await testEndpoint('Check Build Status (after wait)', 'GET', `${API_BASE}/status/${buildId}`);
  } else {
    log(`✗ Generate Agent Code (HTTP ${generateResult.status})`, 'red');
    FAILED++;
  }

  console.log('');

  // 6. Error Handling
  log('6. Testing Error Handling', 'yellow');
  console.log('-------------------------');
  
  await testEndpoint('Validate - Missing Fields', 'POST', `${API_BASE}/validate`, { action: 'validate' }, 400);
  await testEndpoint('Validate - Invalid Brain', 'POST', `${API_BASE}/validate`, {
    name: 'Test',
    description: 'Test',
    brain: 'invalid-brain',
    tools: []
  }, 200);
  
  await testEndpoint('Get Tool - Invalid', 'GET', `${API_BASE}/tools/invalid-tool-id`, null, 404);

  // Summary
  console.log('');
  log('========================', 'cyan');
  log('Test Results', 'cyan');
  log('========================', 'cyan');
  log(`Passed: ${PASSED}`, 'green');
  log(`Failed: ${FAILED}`, 'red');
  console.log('');

  if (FAILED === 0) {
    log('All tests passed! ✓', 'green');
    process.exit(0);
  } else {
    log('Some tests failed. Please review the output above.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
