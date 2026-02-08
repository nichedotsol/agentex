#!/usr/bin/env node

/**
 * Verification script
 * Checks that all required files are present before publishing
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'README.md',
  'bin/install.js',
  'claude-skill.json',
  'gpt-function.json',
  'openclaw-skill.json',
  'scripts/postinstall.js'
];

const packageDir = path.join(__dirname, '..');
let allGood = true;

console.log('🔍 Verifying package structure...\n');

for (const file of requiredFiles) {
  const filePath = path.join(packageDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'));

console.log('\n📦 Package Info:');
console.log(`   Name: ${packageJson.name}`);
console.log(`   Version: ${packageJson.version}`);
console.log(`   Description: ${packageJson.description}`);

if (!packageJson.bin || !packageJson.bin['agentex-install']) {
  console.log('\n❌ Missing bin.agentex-install in package.json');
  allGood = false;
}

if (!packageJson.files || packageJson.files.length === 0) {
  console.log('\n⚠️  No files array in package.json - all files will be included');
}

if (allGood) {
  console.log('\n✅ All checks passed! Ready to publish.');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix before publishing.');
  process.exit(1);
}
