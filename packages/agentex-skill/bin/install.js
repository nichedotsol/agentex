#!/usr/bin/env node

/**
 * AgentEX Skill Installer
 * Interactive CLI to install AgentEX skill for various platforms
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getSkillDir() {
  return path.join(__dirname, '..');
}

function getClaudeSkillsDir() {
  const home = os.homedir();
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Claude', 'skills');
  } else if (platform === 'win32') {
    return path.join(home, 'AppData', 'Roaming', 'Claude', 'skills');
  } else {
    return path.join(home, '.config', 'claude', 'skills');
  }
}

function getOpenClawSkillsDir() {
  return path.join(os.homedir(), '.openclaw', 'skills');
}

async function installClaude() {
  const skillDir = getSkillDir();
  const claudeSkillsDir = getClaudeSkillsDir();
  const sourceFile = path.join(skillDir, 'claude-skill.json');
  const targetFile = path.join(claudeSkillsDir, 'agentex_builder.json');

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(claudeSkillsDir)) {
      fs.mkdirSync(claudeSkillsDir, { recursive: true });
    }

    // Copy skill file
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Claude skill installed successfully!');
    console.log(`   Location: ${targetFile}`);
    console.log('\n   Next steps:');
    console.log('   1. Restart Claude Desktop');
    console.log('   2. The skill will be available as "agentex_builder"');
  } catch (error) {
    console.error('❌ Failed to install Claude skill:', error.message);
    console.log('\n   Manual installation:');
    console.log(`   1. Copy ${sourceFile}`);
    console.log(`   2. Paste to ${claudeSkillsDir}/agentex_builder.json`);
  }
}

async function installOpenClaw() {
  const skillDir = getSkillDir();
  const openClawSkillsDir = getOpenClawSkillsDir();
  const sourceFile = path.join(skillDir, 'openclaw-skill.json');
  const targetFile = path.join(openClawSkillsDir, 'agentex_builder.json');

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(openClawSkillsDir)) {
      fs.mkdirSync(openClawSkillsDir, { recursive: true });
    }

    // Copy skill file
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ OpenClaw skill installed successfully!');
    console.log(`   Location: ${targetFile}`);
    console.log('\n   Next steps:');
    console.log('   1. Restart OpenClaw');
    console.log('   2. The skill will be available as "agentex_builder"');
  } catch (error) {
    console.error('❌ Failed to install OpenClaw skill:', error.message);
    console.log('\n   Manual installation:');
    console.log(`   1. Copy ${sourceFile}`);
    console.log(`   2. Paste to ${openClawSkillsDir}/agentex_builder.json`);
  }
}

function showGPTInstructions() {
  const skillDir = getSkillDir();
  const sourceFile = path.join(skillDir, 'gpt-function.json');

  console.log('\n📋 GPT/OpenAI Installation Instructions:');
  console.log('\n   1. Open OpenAI Platform → Assistants');
  console.log('   2. Select your assistant');
  console.log('   3. Go to "Functions" tab');
  console.log('   4. Click "Add Function"');
  console.log(`   5. Paste the contents of: ${sourceFile}`);
  console.log('   6. Save the assistant');
  console.log('\n   The function will be available as "agentex_builder"');
}

async function main() {
  console.log('\n🚀 AgentEX Skill Installer\n');
  console.log('Select a platform to install:');
  console.log('  1. Claude');
  console.log('  2. GPT/OpenAI');
  console.log('  3. OpenClaw');
  console.log('  4. Show all instructions');
  console.log('  5. Exit\n');

  const answer = await question('Enter your choice (1-5): ');

  switch (answer.trim()) {
    case '1':
      await installClaude();
      break;
    case '2':
      showGPTInstructions();
      break;
    case '3':
      await installOpenClaw();
      break;
    case '4':
      await installClaude();
      console.log('\n');
      showGPTInstructions();
      console.log('\n');
      await installOpenClaw();
      break;
    case '5':
      console.log('Exiting...');
      break;
    default:
      console.log('Invalid choice. Please run again and select 1-5.');
  }

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { installClaude, installOpenClaw, showGPTInstructions };
